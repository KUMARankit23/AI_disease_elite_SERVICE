"""
clean.py
--------
Cleans each raw dataset and saves the result to data/processed/.

Per-dataset logic:
  diabetes  – zero-values in physiological columns are invalid → NaN
  heart     – straightforward numeric; encode any stray categoricals
  kidney    – '?' placeholders → NaN; mixed-type columns need coercion
  liver     – binary label column uses 1/2 → remap to 1/0;
              'Gender' column is categorical

All datasets:
  • Replace '?' and whitespace-only strings with NaN
  • Encode remaining object columns with category codes
  • Impute NaN with column median (robust to outliers)
  • Convert everything to float64
  • Save to data/processed/<name>.csv
"""

import os
import sys
import io
import pandas as pd
import numpy as np

RAW_DIR       = os.path.join("data", "raw")
PROCESSED_DIR = os.path.join("data", "processed")

# data/processed may exist as a stale file (not a directory) — remove it first
if os.path.isfile(PROCESSED_DIR):
    os.remove(PROCESSED_DIR)
    print(f"⚠️  Removed stale file at '{PROCESSED_DIR}' — replacing with directory.")

os.makedirs(PROCESSED_DIR, exist_ok=True)

DATASETS = ["diabetes", "heart", "kidney", "liver"]

# Columns where 0 is physiologically impossible (diabetes dataset)
DIABETES_NONZERO_COLS = [
    "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"
]


# ── CSV repair ────────────────────────────────────────────────────────────────

def _repair_and_load(path: str) -> pd.DataFrame:
    """
    Safely load a CSV regardless of line-ending style.

    Problem: files downloaded via requests on Windows sometimes have CRLF
    line endings but also contain stray bare LF characters mid-line
    (e.g. b'BloodPressure,SkinThickn\\ness,...\\r\\n').  Pandas splits on
    both \\n and \\r\\n, cutting each row in half.

    Fix: only strip bare LFs when the file's primary line ending is CRLF.
    Files that use plain LF (Unix-style) are loaded as-is.
    """
    with open(path, "rb") as fh:
        raw = fh.read()

    crlf_count = raw.count(b"\r\n")
    lf_count   = raw.count(b"\n")

    # Primary delimiter is CRLF when most \n are preceded by \r
    uses_crlf = crlf_count > 0 and crlf_count >= (lf_count * 0.5)

    if uses_crlf:
        # Count bare LFs (not preceded by \r)
        bare_lf_count = lf_count - crlf_count
        if bare_lf_count > 0:
            print(f"    ⚠️  Removing {bare_lf_count} embedded bare LF(s) from {os.path.basename(path)}")
            repaired = bytearray()
            for i, byte in enumerate(raw):
                if byte == ord(b"\n") and (i == 0 or raw[i-1] != ord(b"\r")):
                    continue  # drop bare LF embedded mid-line
                repaired.append(byte)
            raw = bytes(repaired)

    text = raw.decode("utf-8", errors="replace")
    df = pd.read_csv(io.StringIO(text), low_memory=False)
    return df


# ── helpers ───────────────────────────────────────────────────────────────────

def _replace_invalid_strings(df: pd.DataFrame) -> pd.DataFrame:
    """Replace '?', empty strings, and whitespace-only strings with NaN."""
    return df.replace(r"^\s*\??\s*$", np.nan, regex=True)


def _encode_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    """Label-encode every remaining object/string column."""
    for col in df.select_dtypes(include=["object", "category"]).columns:
        codes = df[col].astype("category").cat.codes  # int8, -1 = NaN
        # Convert to float so we can represent NaN, then mask -1 → NaN
        df[col] = codes.astype(float).where(codes != -1, other=np.nan)
    return df


def _coerce_to_numeric(df: pd.DataFrame) -> pd.DataFrame:
    """Force all columns to numeric, turning unconvertible values into NaN."""
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def _impute_median(df: pd.DataFrame) -> pd.DataFrame:
    """Fill NaN with column median. Drops columns that are entirely NaN."""
    all_nan_cols = [c for c in df.columns if df[c].isna().all()]
    if all_nan_cols:
        df.drop(columns=all_nan_cols, inplace=True)
        print(f"    • Dropped {len(all_nan_cols)} all-NaN column(s): {all_nan_cols}")
    for col in df.columns:
        median = df[col].median()
        df[col] = df[col].fillna(median)
    return df


# ── dataset-specific cleaners ─────────────────────────────────────────────────

def _clean_diabetes(df: pd.DataFrame) -> pd.DataFrame:
    print("    • Replacing physiologically-invalid zeros with NaN …")
    for col in DIABETES_NONZERO_COLS:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)
    return df


def _clean_heart(df: pd.DataFrame) -> pd.DataFrame:
    # Nothing special beyond the generic pipeline
    return df


def _clean_kidney(df: pd.DataFrame) -> pd.DataFrame:
    # Strip whitespace from column names (common in this dataset)
    df.columns = df.columns.str.strip()
    # Drop the 'id' column if present (not a feature)
    if "id" in df.columns:
        df.drop(columns=["id"], inplace=True)
        print("    • Dropped 'id' column.")
    return df


def _clean_liver(df: pd.DataFrame) -> pd.DataFrame:
    # Assign column names if the file has no header
    expected_cols = [
        "Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin",
        "Alkaline_Phosphotase", "Alamine_Aminotransferase",
        "Aspartate_Aminotransferase", "Total_Proteins",
        "Albumin", "Albumin_and_Globulin_Ratio", "Dataset"
    ]
    if df.shape[1] == len(expected_cols) and df.columns[0] not in ("Age",):
        # Headerless file
        df.columns = expected_cols
        print("    • Assigned column names to liver dataset.")

    # Remap label: 1 = liver disease, 2 = no disease  →  1 / 0
    label_col = None
    for candidate in ("Dataset", "Selector", "label", "target"):
        if candidate in df.columns:
            label_col = candidate
            break
    if label_col:
        df[label_col] = df[label_col].replace({1: 1, 2: 0})
        print(f"    • Remapped label column '{label_col}': 2→0 (no disease).")

    return df


CLEANERS = {
    "diabetes": _clean_diabetes,
    "heart":    _clean_heart,
    "kidney":   _clean_kidney,
    "liver":    _clean_liver,
}


# ── main pipeline ─────────────────────────────────────────────────────────────

def clean_dataset(name: str) -> bool:
    raw_path  = os.path.join(RAW_DIR, f"{name}.csv")
    out_path  = os.path.join(PROCESSED_DIR, f"{name}.csv")

    print(f"\n{'─'*55}")
    print(f"  🧹  Cleaning [{name}]")
    print(f"{'─'*55}")

    if not os.path.isfile(raw_path):
        print(f"  ❌  Raw file not found: {raw_path}")
        print("      Run download_kaggle.py and standardize.py first.")
        return False

    df = _repair_and_load(raw_path)
    print(f"    • Loaded  {df.shape[0]} rows × {df.shape[1]} cols")

    # 1. Replace invalid string placeholders
    df = _replace_invalid_strings(df)

    # 2. Dataset-specific fixes
    df = CLEANERS[name](df)

    # 3. Encode categoricals
    df = _encode_categoricals(df)

    # 4. Coerce everything to numeric
    df = _coerce_to_numeric(df)

    # 5. Impute with median
    before_nulls = df.isnull().sum().sum()
    df = _impute_median(df)
    after_nulls  = df.isnull().sum().sum()
    print(f"    • Imputed {before_nulls} missing values → {after_nulls} remaining")

    # 6. Final dtype cast
    df = df.astype(np.float64)

    df.to_csv(out_path, index=False)
    print(f"  ✅  Saved → {out_path}  ({df.shape[0]} rows × {df.shape[1]} cols)")
    return True


def run_all() -> None:
    print("\n🚀  Data Cleaning Pipeline")
    print("=" * 55)

    results = {}
    for name in DATASETS:
        success = clean_dataset(name)
        results[name] = "✅ OK" if success else "❌ FAILED"

    print("\n" + "=" * 55)
    print("📊  Cleaning Summary")
    print("=" * 55)
    for name, status in results.items():
        print(f"  {status}  {name}")

    failed = [n for n, s in results.items() if "FAILED" in s]
    if failed:
        print(f"\n⚠️  {len(failed)} dataset(s) failed: {', '.join(failed)}")
        sys.exit(1)
    else:
        print("\n🎉  All datasets cleaned and saved to data/processed/")


if __name__ == "__main__":
    run_all()
