# 🏥 Disease AI Elite

> **Live Demo → [https://ai-disease-elite-service.vercel.app](https://ai-disease-elite-service.vercel.app)**

An AI-powered clinical health screening system that predicts risk for **Diabetes, Heart Disease, Kidney Disease, and Liver Disease** using Machine Learning, SHAP explainability, RAG-based context retrieval, and GPT-4o-mini generated clinical reports.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS |
| Backend | FastAPI, Uvicorn |
| ML Model | Random Forest Classifier (scikit-learn) |
| Explainability | SHAP (TreeExplainer) |
| LLM | OpenAI GPT-4o-mini |
| RAG | Custom retriever with disease knowledge base |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🧠 How It Works

```
User Input (Health Values)
        ↓
FastAPI Backend (Railway)
        ↓
Random Forest Classifier → Risk Score + Prediction
        ↓
SHAP TreeExplainer → Feature Importance
        ↓
RAG Retriever → Relevant Medical Context
        ↓
GPT-4o-mini → Plain-English Clinical Report
        ↓
React Frontend (Vercel) → Downloadable HTML Report + Excel Records
```

---

## 🔬 Diseases Covered

| Disease | Features | Model Threshold |
|---------|----------|----------------|
| Diabetes | 8 clinical features | 0.50 |
| Heart Disease | 13 clinical features | 0.50 |
| Chronic Kidney Disease | 14 lab features | 0.50 |
| Liver Disease | 9 liver function tests | 0.55 |

---

## 📊 Model Details

- **Algorithm:** Random Forest Classifier (300 trees, max depth 10)
- **Class balancing:** `class_weight="balanced"` + minority oversampling
- **Threshold:** Optimised per disease using Youden's J statistic
- **Explainability:** SHAP values for top 8 contributing features
- **Preprocessing:** StandardScaler normalization

---

## 🗂️ Project Structure

```
disease_ai_elite/
├── api/                    # FastAPI backend
│   ├── main.py             # App entry point + CORS
│   ├── routes.py           # /predict, /features, /download-records
│   └── excel_store.py      # Screening records persistence
├── configs/
│   ├── feature_map.py      # Feature definitions per disease
│   └── settings.py         # Environment config
├── models/
│   ├── train_all.py        # Model training pipeline
│   ├── registry.py         # Model loader
│   └── preprocess.py       # Data preprocessing
├── explainability/
│   └── shap_utils.py       # SHAP value computation
├── rag/
│   ├── knowledge.txt       # Medical knowledge base
│   └── retriever.py        # Context retrieval
├── llm/
│   └── generator.py        # GPT-4o-mini report generation
├── data_pipeline/          # Data download, cleaning, validation
├── data/                   # Raw + processed CSVs
├── saved_models/           # Trained .pkl model files
├── frontend/               # React application
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── Form.js     # Disease selector + input sliders
│       │   └── Result.js   # Risk report + SHAP visualization
│       └── api.js          # API base URL config
├── railway.toml            # Railway deployment config
└── requirements.txt
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Add your OpenAI key
echo "OPENAI_API_KEY=your_key_here" > .env

# Train models (first time only)
python -m models.train_all

# Start backend
uvicorn api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, proxies API calls to `http://localhost:8000`.

---

## 🌐 Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | [ai-disease-elite-service.vercel.app](https://ai-disease-elite-service.vercel.app) |
| Backend | Railway | [aidiseaseeliteservice-production.up.railway.app](https://aidiseaseeliteservice-production.up.railway.app) |

### Environment Variables

**Railway (backend):**
```
OPENAI_API_KEY=your_openai_key
```

**Vercel (frontend):**
```
REACT_APP_API_URL=https://aidiseaseeliteservice-production.up.railway.app
```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check + loaded models |
| GET | `/features/{disease}` | Get feature list for a disease |
| POST | `/predict` | Run ML prediction + generate report |
| GET | `/download-records` | Download Excel screening records |

### Sample `/predict` Request

```json
{
  "disease": "diabetes",
  "values": [2, 138, 62, 35, 0, 33.6, 0.127, 47]
}
```

### Sample Response

```json
{
  "disease": "diabetes",
  "prediction": 1,
  "risk": 0.72,
  "risk_label": "HIGH",
  "shap_values": { "Glucose": 0.18, "BMI": 0.09, ... },
  "explanation": "**Risk Assessment**: ...",
  "patient_values": { "Glucose": 138, "BMI": 33.6, ... },
  "report_id": "SCR-20260519-4821"
}
```

---

## ⚠️ Medical Disclaimer

This tool is for **screening and educational purposes only**. It does not constitute a medical diagnosis, clinical opinion, or prescription. Always consult a qualified healthcare professional before making any medical decisions.

---

## 📄 License

MIT License — free to use, modify, and distribute.
