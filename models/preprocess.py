import numpy as np
import pandas as pd


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """
    Light preprocessing for already-cleaned data from data/processed/.
    Converts any remaining string columns to numeric and fills NaN with median.
    Does NOT replace 0 with NaN — processed data already has valid zeros.
    """
    df = df.copy()
    df.replace("?", np.nan, inplace=True)

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    return df
