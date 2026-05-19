import os
import pandas as pd
from datetime import datetime

REPORTS_DIR = "reports"
EXCEL_PATH  = os.path.join(REPORTS_DIR, "health_screening_records.xlsx")

DISEASE_SHEET = {
    "diabetes": "Diabetes",
    "heart":    "Heart Disease",
    "kidney":   "Kidney Disease",
    "liver":    "Liver Disease",
}

FEATURE_LABELS = {
    "Pregnancies":                "No. of Pregnancies",
    "Glucose":                    "Blood Sugar (mg/dL)",
    "BloodPressure":              "Blood Pressure (mm Hg)",
    "SkinThickness":              "Skin Thickness (mm)",
    "Insulin":                    "Insulin Level (μU/mL)",
    "BMI":                        "BMI",
    "DiabetesPedigreeFunction":   "Family Diabetes Score",
    "Age":                        "Age (years)",
    "age":                        "Age (years)",
    "sex":                        "Sex (0=Female, 1=Male)",
    "cp":                         "Chest Pain Type",
    "trestbps":                   "Resting BP (mm Hg)",
    "chol":                       "Cholesterol (mg/dL)",
    "fbs":                        "High Fasting Sugar (0=No, 1=Yes)",
    "restecg":                    "Resting ECG Result",
    "thalach":                    "Max Heart Rate (bpm)",
    "exang":                      "Chest Pain on Exercise (0=No, 1=Yes)",
    "oldpeak":                    "Stress Test Reading",
    "slope":                      "ST Slope Pattern",
    "ca":                         "Blocked Arteries Count",
    "thal":                       "Blood Flow Status",
    "bp":                         "Blood Pressure (mm Hg)",
    "sg":                         "Urine Concentration",
    "al":                         "Protein in Urine (0-5)",
    "su":                         "Sugar in Urine (0-5)",
    "bgr":                        "Blood Glucose (mg/dL)",
    "bu":                         "Blood Urea (mg/dL)",
    "sc":                         "Creatinine (mg/dL)",
    "sod":                        "Sodium (mEq/L)",
    "pot":                        "Potassium (mEq/L)",
    "hemo":                       "Haemoglobin (g/dL)",
    "pcv":                        "Packed Cell Volume (%)",
    "wc":                         "White Blood Cells (cells/μL)",
    "rc":                         "Red Blood Cell Count (millions/μL)",
    "Total_Bilirubin":            "Total Bilirubin (mg/dL)",
    "Direct_Bilirubin":           "Direct Bilirubin (mg/dL)",
    "Alkaline_Phosphotase":       "ALP (IU/L)",
    "Alamine_Aminotransferase":   "ALT (IU/L)",
    "Aspartate_Aminotransferase": "AST (IU/L)",
    "Total_Protiens":             "Total Protein (g/dL)",
    "Albumin":                    "Albumin (g/dL)",
    "Albumin_and_Globulin_Ratio": "Albumin/Globulin Ratio",
}


def save_to_excel(report_id: str, disease: str, patient_values: dict,
                  prediction: int, risk: float, risk_label: str) -> None:
    os.makedirs(REPORTS_DIR, exist_ok=True)
    sheet_name = DISEASE_SHEET.get(disease, disease.title())
    now = datetime.now()

    row: dict = {
        "Report ID":      report_id,
        "Date":           now.strftime("%d %b %Y"),
        "Time":           now.strftime("%H:%M"),
        "Outcome":        "Positive" if prediction == 1 else "Negative",
        "Risk Score (%)": round(risk * 100, 1),
        "Risk Level":     risk_label,
    }
    for feat, val in patient_values.items():
        row[FEATURE_LABELS.get(feat, feat)] = val

    df_new = pd.DataFrame([row])

    if os.path.exists(EXCEL_PATH):
        try:
            all_sheets: dict[str, pd.DataFrame] = {}
            with pd.ExcelFile(EXCEL_PATH, engine="openpyxl") as xls:
                for s in xls.sheet_names:
                    all_sheets[s] = pd.read_excel(xls, sheet_name=s)

            existing = all_sheets.get(sheet_name)
            all_sheets[sheet_name] = (
                pd.concat([existing, df_new], ignore_index=True)
                if existing is not None else df_new
            )

            with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as writer:
                for s, df in all_sheets.items():
                    df.to_excel(writer, sheet_name=s, index=False)
        except Exception as exc:
            print(f"[excel_store] write error: {exc} — creating fresh file")
            with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as writer:
                df_new.to_excel(writer, sheet_name=sheet_name, index=False)
    else:
        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as writer:
            df_new.to_excel(writer, sheet_name=sheet_name, index=False)
