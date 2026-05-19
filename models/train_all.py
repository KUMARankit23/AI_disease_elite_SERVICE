import os
import pandas as pd
import numpy as np
import joblib
import shap
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, roc_curve
from sklearn.utils import resample

from configs.feature_map import FEATURE_MAP
from models.preprocess import preprocess

os.makedirs("saved_models", exist_ok=True)


def get_target_column(df: pd.DataFrame, disease: str, config: dict) -> pd.Series:
    target = config["target"]

    if target in df.columns:
        y = df[target]
    else:
        candidates = [c for c in df.columns if c.startswith(target)]
        if not candidates:
            raise KeyError(
                f"Target column '{target}' not found in {disease} dataframe. "
                f"Available: {list(df.columns)}"
            )
        y = df[candidates[0]]

    if disease == "kidney":
        y = y.astype(float).astype(int)
        if y.nunique() == 2 and sorted(y.unique()) == [0, 1]:
            y = 1 - y
    elif disease == "liver":
        y = pd.to_numeric(y, errors="coerce").fillna(2)
        y = (y == 1).astype(int)
    else:
        y = pd.to_numeric(y, errors="coerce").fillna(0).astype(int)

    return y


def oversample_minority(X: np.ndarray, y: np.ndarray) -> tuple:
    """Upsample minority class to match majority class size."""
    classes, counts = np.unique(y, return_counts=True)
    max_count = counts.max()
    X_parts, y_parts = [], []
    for cls in classes:
        mask = y == cls
        X_cls, y_cls = X[mask], y[mask]
        if len(X_cls) < max_count:
            X_up, y_up = resample(X_cls, y_cls, n_samples=max_count, random_state=42)
            X_parts.append(X_up)
            y_parts.append(y_up)
        else:
            X_parts.append(X_cls)
            y_parts.append(y_cls)
    return np.vstack(X_parts), np.concatenate(y_parts)


def find_optimal_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """Find threshold that maximises Youden's J (sensitivity + specificity - 1)."""
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    j_scores = tpr - fpr
    best_idx = int(np.argmax(j_scores))
    return float(thresholds[best_idx])


def train(disease: str):
    config = FEATURE_MAP[disease]
    csv_path = f"data/processed/{disease}.csv"

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Processed data not found: {csv_path}")

    df = pd.read_csv(csv_path)
    df = preprocess(df)

    features = config["features"]
    missing = [f for f in features if f not in df.columns]
    if missing:
        raise ValueError(f"Missing features in {disease} CSV: {missing}")

    X = df[features].copy().values
    y = get_target_column(df, disease, config).values

    valid_mask = ~np.isnan(y.astype(float))
    X, y = X[valid_mask], y[valid_mask]

    dist = dict(zip(*np.unique(y, return_counts=True)))
    print(f"[{disease}] shape={X.shape}, class distribution: {dist}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    # Oversample minority class on TRAINING data only
    X_train_bal, y_train_bal = oversample_minority(X_train_scaled, y_train)
    print(f"[{disease}] After oversampling: {dict(zip(*np.unique(y_train_bal, return_counts=True)))}")

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_bal, y_train_bal)

    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    print(f"[{disease}] Accuracy={acc:.4f}, AUC={auc:.4f}")

    # Compute optimal decision threshold from test set
    threshold = find_optimal_threshold(y_test, y_prob)
    threshold = max(0.40, min(0.75, threshold))   # clamp to sane range
    print(f"[{disease}] Optimal threshold: {threshold:.4f}")

    # Verify healthy-value probability on liver test case
    if disease == "liver":
        healthy = np.array([[32, 0.7, 0.1, 93, 25, 26, 7.4, 4.5, 1.6]])
        h_scaled = scaler.transform(healthy)
        h_prob = model.predict_proba(h_scaled)[0][1]
        print(f"[liver] Healthy test-case probability: {h_prob:.4f} (should be < {threshold:.2f})")

    explainer = shap.TreeExplainer(model)

    joblib.dump(model,     f"saved_models/{disease}_model.pkl")
    joblib.dump(scaler,    f"saved_models/{disease}_scaler.pkl")
    joblib.dump(explainer, f"saved_models/{disease}_explainer.pkl")
    joblib.dump(features,  f"saved_models/{disease}_features.pkl")
    joblib.dump(threshold, f"saved_models/{disease}_threshold.pkl")

    print(f"[{disease}] Saved to saved_models/\n")


if __name__ == "__main__":
    for d in ["diabetes", "heart", "kidney", "liver"]:
        try:
            train(d)
        except Exception as e:
            print(f"ERROR training {d}: {e}")
            import traceback
            traceback.print_exc()
