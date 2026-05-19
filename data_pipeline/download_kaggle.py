"""
download_kaggle.py
------------------
Downloads datasets from Kaggle using the Kaggle CLI (subprocess).
Unzips each dataset into data/raw/ and prints clear progress logs.

Prerequisites:
  - pip install kaggle
  - Place kaggle.json in %USERPROFILE%\\.kaggle\\kaggle.json  (Windows)
    OR set KAGGLE_USERNAME / KAGGLE_KEY environment variables
"""

import os
import sys
import subprocess
import zipfile
import shutil
import glob

# ── paths ──────────────────────────────────────────────────────────────────────
RAW_DIR = os.path.join("data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

# ── dataset registry ───────────────────────────────────────────────────────────
DATASETS = {
    "diabetes": "uciml/pima-indians-diabetes-database",
    "heart":    "johnsmith88/heart-disease-dataset",
    "kidney":   "mansoordaku/ckdisease",
    "liver":    "uciml/indian-liver-patient-records",
}


def _find_kaggle() -> str:
    """
    Return the path to the kaggle executable.
    Handles Windows where kaggle.exe lives in Scripts/ and may not be on PATH.
    """
    # 1. Already on PATH?
    kaggle_on_path = shutil.which("kaggle")
    if kaggle_on_path:
        return kaggle_on_path

    # 2. Common Windows locations
    python_dir = os.path.dirname(sys.executable)
    candidates = [
        os.path.join(python_dir, "Scripts", "kaggle.exe"),
        os.path.join(python_dir, "Scripts", "kaggle"),
        os.path.join(os.path.expanduser("~"), "AppData", "Roaming",
                     "Python", "Scripts", "kaggle.exe"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path

    raise FileNotFoundError(
        "kaggle CLI not found. Install it with:  pip install kaggle\n"
        "Then place kaggle.json in %USERPROFILE%\\.kaggle\\  (Windows)"
    )


def _unzip_into(zip_path: str, dest_dir: str) -> None:
    """Extract all files from zip_path into dest_dir."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
    os.remove(zip_path)
    print(f"    ✅ Unzipped → {dest_dir}")


def download_dataset(name: str, slug: str, kaggle_exe: str) -> bool:
    """
    Download a single Kaggle dataset by slug into RAW_DIR.
    Returns True on success, False on failure.
    """
    print(f"\n{'─'*55}")
    print(f"  📥  Downloading  [{name}]  →  {slug}")
    print(f"{'─'*55}")

    cmd = [
        kaggle_exe, "datasets", "download",
        "--dataset", slug,
        "--path", RAW_DIR,
        "--unzip",          # let kaggle CLI unzip directly
        "--force",          # overwrite if already present
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(f"  ❌  kaggle CLI error for [{name}]:")
        print(result.stderr.strip())
        return False

    print(result.stdout.strip())

    # ── fallback: if --unzip didn't work, unzip manually ──────────────────────
    zip_files = glob.glob(os.path.join(RAW_DIR, "*.zip"))
    for zf in zip_files:
        print(f"  📦  Manually unzipping {os.path.basename(zf)} …")
        _unzip_into(zf, RAW_DIR)

    print(f"  ✅  [{name}] downloaded successfully.")
    return True


def download_all() -> None:
    print("\n🚀  Kaggle Dataset Downloader")
    print("=" * 55)

    try:
        kaggle_exe = _find_kaggle()
        print(f"  🔧  Using kaggle at: {kaggle_exe}\n")
    except FileNotFoundError as exc:
        print(f"\n❌  {exc}")
        sys.exit(1)

    results = {}
    for name, slug in DATASETS.items():
        success = download_dataset(name, slug, kaggle_exe)
        results[name] = "✅ OK" if success else "❌ FAILED"

    print("\n" + "=" * 55)
    print("📊  Download Summary")
    print("=" * 55)
    for name, status in results.items():
        print(f"  {status}  {name}")

    failed = [n for n, s in results.items() if "FAILED" in s]
    if failed:
        print(f"\n⚠️  {len(failed)} dataset(s) failed: {', '.join(failed)}")
        print("    Check your Kaggle credentials and dataset slugs.")
        sys.exit(1)
    else:
        print("\n🎉  All datasets downloaded into data/raw/")


if __name__ == "__main__":
    download_all()
