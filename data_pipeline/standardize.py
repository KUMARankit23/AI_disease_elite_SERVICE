"""
standardize.py
--------------
Renames raw downloaded CSV files to canonical names:
    diabetes.csv  heart.csv  kidney.csv  liver.csv

Kaggle datasets often unzip with unpredictable filenames.
This script uses keyword matching to identify and rename them.
Handles duplicates and conflicts gracefully.
"""

import os
import sys
import glob
import shutil

RAW_DIR = os.path.join("data", "raw")

# ── mapping: canonical name → keywords to search in filenames ─────────────────
CANONICAL = {
    "diabetes": ["diabetes", "pima"],
    "heart":    ["heart"],
    "kidney":   ["kidney", "ckd", "chronic"],
    "liver":    ["liver", "ilpd", "indian_liver"],
}


def _find_csv_for(name: str, keywords: list[str]) -> list[str]:
    """Return all CSV files in RAW_DIR whose name contains any keyword."""
    all_csvs = glob.glob(os.path.join(RAW_DIR, "**", "*.csv"), recursive=True)
    matches = []
    for path in all_csvs:
        basename = os.path.basename(path).lower()
        # Skip files that are already canonically named for a different dataset
        if any(
            basename == f"{other}.csv"
            for other in CANONICAL
            if other != name
        ):
            continue
        if any(kw in basename for kw in keywords):
            matches.append(path)
    return matches


def standardize() -> None:
    print("\n🔄  Standardizing raw file names")
    print("=" * 55)

    if not os.path.isdir(RAW_DIR):
        print(f"❌  Raw directory not found: {RAW_DIR}")
        print("    Run download_kaggle.py first.")
        sys.exit(1)

    results = {}

    for name, keywords in CANONICAL.items():
        target = os.path.join(RAW_DIR, f"{name}.csv")

        # Already correctly named?
        if os.path.isfile(target):
            print(f"  ✅  {name}.csv already exists — skipping.")
            results[name] = "already present"
            continue

        matches = _find_csv_for(name, keywords)

        if not matches:
            print(f"  ⚠️   No CSV found for [{name}] "
                  f"(keywords: {keywords})")
            results[name] = "NOT FOUND"
            continue

        if len(matches) > 1:
            # Prefer the shortest path (most likely the direct file, not a sub-folder copy)
            matches.sort(key=lambda p: len(p))
            print(f"  ⚠️   Multiple matches for [{name}], using: "
                  f"{os.path.basename(matches[0])}")

        src = matches[0]
        shutil.move(src, target)
        print(f"  ✅  Renamed  '{os.path.basename(src)}'  →  '{name}.csv'")
        results[name] = f"renamed from {os.path.basename(src)}"

    # ── remove leftover zip / extra files ─────────────────────────────────────
    leftover_zips = glob.glob(os.path.join(RAW_DIR, "*.zip"))
    for z in leftover_zips:
        os.remove(z)
        print(f"  🗑️   Removed leftover zip: {os.path.basename(z)}")

    print("\n" + "=" * 55)
    print("📊  Standardization Summary")
    print("=" * 55)
    for name, status in results.items():
        icon = "✅" if status != "NOT FOUND" else "❌"
        print(f"  {icon}  {name:10s}  →  {status}")

    missing = [n for n, s in results.items() if s == "NOT FOUND"]
    if missing:
        print(f"\n⚠️  Missing datasets: {', '.join(missing)}")
        print("    Re-run download_kaggle.py to fetch them.")
        sys.exit(1)
    else:
        print("\n🎉  All files standardized in data/raw/")


if __name__ == "__main__":
    standardize()
