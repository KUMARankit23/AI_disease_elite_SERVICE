import os
from openai import OpenAI
from configs.settings import OPENAI_MODEL

# Lazy client — created on first use so missing key doesn't crash startup
_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is not set. "
                "Add it in Railway → Variables."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def generate_explanation(
    context: str,
    shap_values: dict,
    disease: str,
    patient_values: dict,
    prediction: int,
    risk_score: float,
) -> str:
    """
    Generate a human-readable explanation using:
    - RAG-retrieved disease context
    - Per-feature SHAP values (sorted by absolute importance)
    - Patient's actual input values
    - Model prediction and risk probability
    """
    risk_label = "HIGH" if risk_score >= 0.6 else ("MODERATE" if risk_score >= 0.4 else "LOW")
    outcome = "positive (disease likely)" if prediction == 1 else "negative (disease unlikely)"

    # Sort SHAP values by absolute magnitude (most influential first)
    sorted_shap = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
    shap_summary = "\n".join(
        f"  - {feat}: SHAP={val:+.4f}, patient value={patient_values.get(feat, 'N/A')}"
        for feat, val in sorted_shap[:8]  # top 8 features
    )

    prompt = f"""You are a medical AI assistant. A patient has been screened for {disease}.

PREDICTION: {outcome}
RISK SCORE: {risk_score:.1%} ({risk_label} risk)

TOP CONTRIBUTING FEATURES (SHAP analysis — positive values push toward disease, negative away):
{shap_summary}

RELEVANT MEDICAL KNOWLEDGE:
{context}

Please provide a concise, patient-friendly explanation with three sections:
1. **Risk Assessment**: What the prediction means and how confident we are.
2. **Key Drivers**: Which 3-4 features most influenced this result and why they matter clinically.
3. **Advice**: Practical, actionable recommendations the patient can discuss with their doctor.

Keep the tone clear and supportive, avoid excessive medical jargon, and remind the patient this is a screening tool — not a diagnosis."""

    response = _get_client().chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.4,
    )

    return response.choices[0].message.content
