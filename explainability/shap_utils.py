import numpy as np


def compute_shap(explainer, data: np.ndarray, feature_names: list) -> dict:
    """
    Compute SHAP values for a single sample and return a {feature: value} dict.
    Handles both old SHAP (list of arrays per class) and new SHAP (single array).
    """
    raw = explainer.shap_values(data)

    # Old SHAP: list of [neg_class_array, pos_class_array]
    if isinstance(raw, list) and len(raw) == 2:
        vals = np.array(raw[1][0])
    # Newer SHAP returning 3D array [n_samples, n_features, n_classes]
    elif isinstance(raw, np.ndarray) and raw.ndim == 3:
        vals = raw[0, :, 1]
    # Newer SHAP returning 2D array [n_samples, n_features] (positive class unified)
    elif isinstance(raw, np.ndarray) and raw.ndim == 2:
        vals = raw[0]
    else:
        vals = np.array(raw).flatten()

    return {
        feature: round(float(val), 6)
        for feature, val in zip(feature_names, vals)
    }
