import os
import joblib
from configs.settings import MODEL_DIR
from configs.feature_map import FEATURE_MAP

# Default thresholds per disease (used if no saved threshold found)
DEFAULT_THRESHOLDS = {
    "diabetes": 0.50,
    "heart":    0.50,
    "kidney":   0.50,
    "liver":    0.55,
}


class ModelRegistry:
    def __init__(self):
        self._models: dict = {}

    def load_all(self):
        for disease in FEATURE_MAP:
            try:
                self._load(disease)
            except FileNotFoundError as e:
                print(f"WARNING: Could not load model for '{disease}': {e}")

    def _load(self, disease: str):
        base = os.path.join(MODEL_DIR, disease)

        required = {
            "model":    f"{base}_model.pkl",
            "scaler":   f"{base}_scaler.pkl",
            "explainer":f"{base}_explainer.pkl",
        }
        for key, path in required.items():
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Missing {key} at {path}. Run: python -m models.train_all"
                )

        features_path  = f"{base}_features.pkl"
        threshold_path = f"{base}_threshold.pkl"

        self._models[disease] = {
            "model":     joblib.load(required["model"]),
            "scaler":    joblib.load(required["scaler"]),
            "explainer": joblib.load(required["explainer"]),
            "features":  (
                joblib.load(features_path)
                if os.path.exists(features_path)
                else FEATURE_MAP[disease]["features"]
            ),
            "threshold": (
                joblib.load(threshold_path)
                if os.path.exists(threshold_path)
                else DEFAULT_THRESHOLDS.get(disease, 0.50)
            ),
        }
        print(f"Loaded '{disease}' model  threshold={self._models[disease]['threshold']:.4f}")

    def get(self, disease: str) -> dict:
        if disease not in self._models:
            raise KeyError(
                f"No model loaded for '{disease}'. "
                f"Available: {list(self._models.keys())}"
            )
        return self._models[disease]

    def available(self) -> list:
        return list(self._models.keys())
