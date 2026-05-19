from __future__ import annotations

import os
import random
from datetime import datetime

import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

from models.registry import ModelRegistry
from explainability.shap_utils import compute_shap
from rag.retriever import retrieve_context
from llm.generator import generate_explanation
from configs.feature_map import FEATURE_MAP
from api.excel_store import save_to_excel, EXCEL_PATH

router   = APIRouter()
registry = ModelRegistry()  # populated in lifespan (api/main.py)


# ── Pydantic models ──────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    disease: str
    values: list[float]

    @field_validator("disease")
    @classmethod
    def validate_disease(cls, v: str) -> str:
        supported = list(FEATURE_MAP.keys())
        if v.lower() not in supported:
            raise ValueError(f"Unsupported disease '{v}'. Choose from: {supported}")
        return v.lower()


class PredictResponse(BaseModel):
    disease: str
    prediction: int
    risk: float
    risk_label: str
    shap_values: dict[str, float]
    explanation: str
    patient_values: dict[str, float]
    report_id: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def compute_risk_label(risk: float, prediction: int) -> str:
    if prediction == 0:
        return "LOW" if risk < 0.45 else "MODERATE"
    else:
        return "HIGH" if risk >= 0.70 else "MODERATE"


def generate_report_id() -> str:
    return f"SCR-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "loaded_models": registry.available()}


@router.get("/features/{disease}")
def get_features(disease: str):
    disease = disease.lower()
    if disease not in FEATURE_MAP:
        raise HTTPException(status_code=404, detail=f"Unknown disease: {disease}")
    return {"disease": disease, "features": FEATURE_MAP[disease]["features"]}


@router.post("/predict", response_model=PredictResponse)
def predict(data: PredictRequest):
    disease          = data.disease
    expected_features = FEATURE_MAP[disease]["features"]

    if len(data.values) != len(expected_features):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Expected {len(expected_features)} values for '{disease}', "
                f"got {len(data.values)}. Features: {expected_features}"
            ),
        )

    if disease not in registry.available():
        raise HTTPException(
            status_code=503,
            detail=f"Model for '{disease}' not loaded. Run: python -m models.train_all",
        )

    bundle        = registry.get(disease)
    feature_names = bundle["features"]
    threshold     = bundle["threshold"]
    patient_vals  = dict(zip(feature_names, data.values))
    input_arr     = np.array([data.values], dtype=float)

    try:
        scaled     = bundle["scaler"].transform(input_arr)
        risk       = float(bundle["model"].predict_proba(scaled)[0][1])
        prediction = 1 if risk >= threshold else 0
        shap_vals  = compute_shap(bundle["explainer"], scaled, feature_names)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    risk_label = compute_risk_label(risk, prediction)
    report_id  = generate_report_id()

    # RAG context from top-3 drivers
    top_feats = sorted(shap_vals.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    rag_query = " ".join(f for f, _ in top_feats)
    context   = retrieve_context(disease, query=rag_query)

    try:
        explanation = generate_explanation(
            context=context,
            shap_values=shap_vals,
            disease=disease,
            patient_values=patient_vals,
            prediction=prediction,
            risk_score=risk,
        )
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower() or "insufficient_quota" in err:
            explanation = "__quota_exceeded__"
        elif "401" in err or "api_key" in err.lower():
            explanation = "__invalid_key__"
        else:
            explanation = "__llm_unavailable__"

    # Persist to Excel
    try:
        save_to_excel(
            report_id=report_id,
            disease=disease,
            patient_values=patient_vals,
            prediction=prediction,
            risk=risk,
            risk_label=risk_label,
        )
    except Exception as e:
        print(f"[excel] save failed: {e}")

    return PredictResponse(
        disease=disease,
        prediction=prediction,
        risk=round(risk, 4),
        risk_label=risk_label,
        shap_values=shap_vals,
        explanation=explanation,
        patient_values=patient_vals,
        report_id=report_id,
    )


@router.get("/download-records")
def download_records():
    if not os.path.exists(EXCEL_PATH):
        raise HTTPException(
            status_code=404,
            detail="No screening records found yet. Run at least one screening first.",
        )
    return FileResponse(
        path=EXCEL_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="health_screening_records.xlsx",
    )
