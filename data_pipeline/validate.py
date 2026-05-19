"""
validate.py
-----------
Validates every processed dataset and prints a detailed report.

Checks:
  • File exists in data/processed/
  • Shape (rows × cols)
  • Missing-value count per column (and total)
  • Column names and dtypes
  • Exits with code 1 if any nulls remain (pipeline integrity guard)
"""

import os
import sys
import pandas as pd

PROCESSED_DIR = os.path.join("data", "processed")
DATASETS      = ["diabetes", "heart", "kidney", "liver"]


def validate_dataset(name: str) -> bool:
    """
    Validate a single processed dataset.
    Returns True if the dataset passes all checks, False otherwise.
    """
    path = os.path.join(PROCESSED_DIR, f"{name}.csv")

    print(f"\n{'═'*55}")
    print(f"  📋  {name.upper()} DATASET")
    print(f"{'═'*55}")

    # ── existence check ────────────────────────────────────────────────────────
    if not os.path.isfile(path):
        print(f"  ❌  File not found: {path}")
        print("      Run clean.py first.")
        return False

    df = pd.read_csv(path)

    # ── shape ──────────────────────────────────────────────────────────────────
    print(f"  Shape          : {df.shape[0]} rows × {df.shape[1]} columns")

    # ── columns & dtypes ───────────────────────────────────────────────────────
    print(f"  Columns ({df.shape[1]})    :")
    for col in df.columns:
        print(f"      {col:<40s}  {str(df[col].dtype)}")

    # ── missing values ─────────────────────────────────────────────────────────
    total_missing = df.isnull().sum().sum()
    print(f"\n  Total missing  : {total_missing}")

    col_missing = df.isnull().sum()
    cols_with_nulls = col_missing[col_missing > 0]
    if not cols_with_nulls.empty:
        print("  Columns with nulls:")
        for col, cnt in cols_with_nulls.items():
            print(f"      {col:<40s}  {cnt} missing")
    else:
        print("  ✅  No missing values detected.")

    # ── integrity result ───────────────────────────────────────────────────────
    passed = total_missing == 0
    status = "✅  PASS" if passed else "❌  FAIL — nulls remain after cleaning"
    print(f"\n  Result         : {status}")
    return passed


def run_all() -> None:
    print("\n🔍  Dataset Validation Report")
    print("=" * 55)

    if not os.path.isdir(PROCESSED_DIR):
        print(f"❌  Processed directory not found: {PROCESSED_DIR}")
        print("    Run clean.py first.")
        sys.exit(1)

    results = {}
    for name in DATASETS:
        results[name] = validate_dataset(name)

    # ── summary ────────────────────────────────────────────────────────────────
    print(f"\n{'═'*55}")
    print("📊  Validation Summary")
    print(f"{'═'*55}")
    all_passed = True
    for name, passed in results.items():
        icon = "✅" if passed else "❌"
        print(f"  {icon}  {name}")
        if not passed:
            all_passed = False

    if all_passed:
        print("\n🎉  All datasets passed validation!")
    else:
        print("\n⚠️  Some datasets failed validation. Re-run clean.py.")
        sys.exit(1)


if __name__ == "__main__":
    run_all()
