import React, { useEffect, useState } from 'react';
import API_BASE from '../api';

/* ── Friendly labels & units ───────────────────────────────────────── */
const LABELS = {
  Pregnancies:'Number of Pregnancies', Glucose:'Blood Sugar Level',
  BloodPressure:'Blood Pressure', SkinThickness:'Skin Fold Thickness',
  Insulin:'Insulin Level', BMI:'Body Mass Index',
  DiabetesPedigreeFunction:'Family Diabetes History Score', Age:'Age', age:'Age',
  sex:'Biological Sex', cp:'Type of Chest Pain', trestbps:'Resting Blood Pressure',
  chol:'Cholesterol Level', fbs:'High Fasting Blood Sugar',
  restecg:'Resting ECG Result', thalach:'Maximum Heart Rate Achieved',
  exang:'Chest Pain During Exercise', oldpeak:'Stress Test Reading',
  slope:'Stress Test Pattern', ca:'Blocked Coronary Arteries', thal:'Blood Flow Status',
  bp:'Blood Pressure', sg:'Urine Concentration', al:'Protein in Urine',
  su:'Sugar in Urine', bgr:'Blood Glucose', bu:'Blood Urea Level',
  sc:'Creatinine (Kidney Marker)', sod:'Sodium Level', pot:'Potassium Level',
  hemo:'Haemoglobin Level', pcv:'Red Cell Percentage', wc:'White Blood Cell Count',
  rc:'Red Blood Cell Count',
  Total_Bilirubin:'Total Bilirubin', Direct_Bilirubin:'Direct Bilirubin',
  Alkaline_Phosphotase:'Alkaline Phosphatase (ALP)',
  Alamine_Aminotransferase:'ALT (Liver Enzyme)',
  Aspartate_Aminotransferase:'AST (Liver / Heart Enzyme)',
  Total_Protiens:'Total Protein', Albumin:'Albumin',
  Albumin_and_Globulin_Ratio:'Albumin / Globulin Ratio',
};

const UNITS = {
  Glucose:'mg/dL', BloodPressure:'mm Hg', SkinThickness:'mm',
  Insulin:'μU/mL', trestbps:'mm Hg', chol:'mg/dL', thalach:'bpm',
  bp:'mm Hg', bgr:'mg/dL', bu:'mg/dL', sc:'mg/dL', sod:'mEq/L',
  pot:'mEq/L', hemo:'g/dL', pcv:'%', Age:'yrs', age:'yrs',
  Total_Bilirubin:'mg/dL', Direct_Bilirubin:'mg/dL',
  Alkaline_Phosphotase:'IU/L', Alamine_Aminotransferase:'IU/L',
  Aspartate_Aminotransferase:'IU/L', Total_Protiens:'g/dL',
  Albumin:'g/dL', wc:'cells/μL',
};

const DISEASE_NAMES = {
  diabetes:'Diabetes', heart:'Heart Disease',
  kidney:'Chronic Kidney Disease', liver:'Liver Disease',
};

const VERDICT = {
  HIGH: {
    positive: { icon:'⚠️', title:'High Risk Indicators Detected',    sub:'Multiple parameters fall outside the healthy range. We strongly recommend consulting a doctor promptly.', border:'border-red-300',    bg:'bg-red-50',    text:'text-red-800',    badge:'bg-red-100 text-red-700 border-red-200' },
    negative: { icon:'🔶', title:'Elevated Risk — Below Threshold',  sub:'Some parameters are of concern but the overall result is borderline. A check-up is still advisable.',       border:'border-amber-300',  bg:'bg-amber-50',  text:'text-amber-800',  badge:'bg-amber-100 text-amber-700 border-amber-200' },
  },
  MODERATE: {
    positive: { icon:'🔶', title:'Moderate Risk — Attention Needed', sub:'Some parameters are of concern. A medical check-up with your healthcare provider is recommended.',           border:'border-amber-300',  bg:'bg-amber-50',  text:'text-amber-800',  badge:'bg-amber-100 text-amber-700 border-amber-200' },
    negative: { icon:'🔵', title:'Borderline — Within Normal Limits',sub:'Some risk factors are present but the overall result is normal. Maintaining a healthy lifestyle is advised.',  border:'border-blue-300',   bg:'bg-blue-50',   text:'text-blue-800',   badge:'bg-blue-100 text-blue-700 border-blue-200' },
  },
  LOW: {
    positive: { icon:'✅', title:'Low Risk — Mild Indicators Only',  sub:'The screening found only mild indicators. Your values are generally within acceptable ranges.',              border:'border-emerald-300',bg:'bg-emerald-50',text:'text-emerald-800',badge:'bg-emerald-100 text-emerald-700 border-emerald-200' },
    negative: { icon:'✅', title:'All Clear — No Significant Risk',  sub:'Your values are within healthy ranges. Continue your current healthy habits.',                               border:'border-emerald-300',bg:'bg-emerald-50',text:'text-emerald-800',badge:'bg-emerald-100 text-emerald-700 border-emerald-200' },
  },
};

const LLM_ERRORS = {
  __quota_exceeded__: { icon:'💳', title:'Assessment Temporarily Unavailable', msg:'The clinical commentary service is currently unavailable due to account limits. The risk score and parameter analysis above remain valid.' },
  __invalid_key__:    { icon:'🔑', title:'Service Configuration Error',        msg:'There is a configuration issue with the commentary service. The risk score and parameter analysis above remain valid.' },
  __llm_unavailable__:{ icon:'🔌', title:'Commentary Service Offline',         msg:'Unable to generate the written assessment at this time. The risk score and parameter analysis above remain valid.' },
};

function classifyExplanation(text) {
  if (!text) return 'ok';
  if (LLM_ERRORS[text]) return text;
  const t = text.toLowerCase();
  if (t.includes('429') || t.includes('quota') || t.includes('billing') || t.includes('insufficient_quota')) return '__quota_exceeded__';
  if (t.includes('401') || t.includes('invalid_api_key') || t.includes('api_key')) return '__invalid_key__';
  if (t.includes('llm explanation unavailable') || t.includes('error code')) return '__llm_unavailable__';
  return 'ok';
}

/* ── Circular gauge ───────────────────────────────────────────────── */
function CircularGauge({ pct, colorKey }) {
  const [drawn, setDrawn] = useState(0);
  const R = 54, C = 2 * Math.PI * R;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const stroke =
    colorKey === 'red'    ? ['#FCA5A5', '#DC2626'] :
    colorKey === 'yellow' ? ['#FDE68A', '#D97706'] :
                            ['#6EE7B7', '#059669'];

  const gradId = `g-${colorKey}`;
  const offset = C - (drawn / 100) * C;

  return (
    <svg width="130" height="130" viewBox="0 0 140 140">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stroke[0]}/>
          <stop offset="100%" stopColor={stroke[1]}/>
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={R} fill="none" stroke="#E2E8F0" strokeWidth="12"/>
      <circle cx="70" cy="70" r={R} fill="none"
        stroke={`url(#${gradId})`} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="70" y="63" textAnchor="middle" fontSize="22" fontWeight="800" fill={stroke[1]}>{pct}%</text>
      <text x="70" y="80" textAnchor="middle" fontSize="9"  fontWeight="700" fill="#94A3B8" letterSpacing="1">RISK SCORE</text>
    </svg>
  );
}

/* ── Animated linear bar ──────────────────────────────────────────── */
function AnimBar({ pct, colorKey, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  const cls =
    colorKey === 'red'    ? 'from-red-300 to-red-500' :
    colorKey === 'yellow' ? 'from-amber-300 to-amber-500' :
                            'from-emerald-300 to-emerald-500';
  return (
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${cls}`}
           style={{ width:`${w}%`, transition:'width 1.1s cubic-bezier(0.4,0,0.2,1)' }}/>
    </div>
  );
}

/* ── Section divider ──────────────────────────────────────────────── */
function SectionBand({ number, title }) {
  return (
    <div className="bg-apollo-700 text-white px-6 py-2 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-white/20 text-xs font-black flex items-center justify-center shrink-0">{number}</span>
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </div>
  );
}

/* ── Parameter analysis ───────────────────────────────────────────── */
function ParameterRow({ feat, shapVal, patientVal, maxAbs, delay }) {
  const [w, setW] = useState(0);
  const pct = Math.round((Math.abs(shapVal) / maxAbs) * 100);

  useEffect(() => { const t = setTimeout(() => setW(pct), 80 + delay); return () => clearTimeout(t); }, [pct, delay]);

  const up = shapVal >= 0;
  const abs = Math.abs(shapVal);
  const impact =
    abs > 0.06 && up  ? { label:'Elevated — primary concern',      cls:'text-red-700',     bg:'bg-red-50 border-red-200',     dot:'bg-red-500' } :
    abs > 0.02 && up  ? { label:'Slightly elevated — minor concern',cls:'text-amber-700',   bg:'bg-amber-50 border-amber-200', dot:'bg-amber-500' } :
    abs > 0.06 && !up ? { label:'Favourable — protective factor',   cls:'text-emerald-700', bg:'bg-emerald-50 border-emerald-200',dot:'bg-emerald-500' } :
    abs > 0.02 && !up ? { label:'Within normal range',              cls:'text-blue-700',    bg:'bg-blue-50 border-blue-200',   dot:'bg-blue-400' } :
                        { label:'Minimal impact',                   cls:'text-slate-500',   bg:'bg-slate-50 border-slate-200', dot:'bg-slate-300' };

  const displayVal = patientVal !== undefined
    ? `${typeof patientVal === 'number' && !Number.isInteger(patientVal) ? patientVal.toFixed(1) : patientVal}${UNITS[feat] ? ' ' + UNITS[feat] : ''}`
    : null;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2.5 pr-3 text-sm font-medium text-slate-700 whitespace-nowrap">{LABELS[feat] || feat}</td>
      <td className="py-2.5 pr-4 text-sm font-bold text-slate-800 whitespace-nowrap tabular-nums">
        {displayVal ?? <span className="text-slate-400 font-normal text-xs">—</span>}
      </td>
      <td className="py-2.5 pr-4 w-32">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${up ? 'bg-red-400' : 'bg-emerald-400'}`}
               style={{ width:`${w}%`, transition:'width 0.8s ease-out' }}/>
        </div>
      </td>
      <td className="py-2.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${impact.bg} ${impact.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${impact.dot}`}/>
          {impact.label}
        </span>
      </td>
    </tr>
  );
}

function ParameterAnalysis({ shapValues, patientValues }) {
  const entries = Object.entries(shapValues);
  if (!entries.length) return null;
  const sorted = [...entries].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8);
  const maxAbs = Math.max(...sorted.map(([,v]) => Math.abs(v)), 0.001);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px]">
        <thead>
          <tr className="border-b-2 border-slate-200">
            <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider pr-3">Parameter</th>
            <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider pr-4">Your Value</th>
            <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider pr-4 w-32">Influence</th>
            <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([feat, val], i) => (
            <ParameterRow
              key={feat} feat={feat} shapVal={val}
              patientVal={patientValues?.[feat]}
              maxAbs={maxAbs} delay={i * 60}
            />
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded bg-red-400 inline-block"/>Contributes to risk</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded bg-emerald-400 inline-block"/>Reduces risk</span>
        <span className="flex items-center gap-1.5 italic">Influence bar shows relative weight of each parameter</span>
      </div>
    </div>
  );
}

/* ── Render markdown-style bold text ──────────────────────────────── */
function MedicalText({ text }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5"/>;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-bold text-slate-900">{part}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ── Clinical assessment box ──────────────────────────────────────── */
function AssessmentBox({ explanation }) {
  const kind = classifyExplanation(explanation);
  const err  = LLM_ERRORS[kind];

  if (err) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-2xl shrink-0">{err.icon}</span>
        <div>
          <div className="font-bold text-amber-800 text-sm mb-1">{err.title}</div>
          <div className="text-amber-700 text-sm leading-relaxed">{err.msg}</div>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <MedicalText text={explanation} />
    </div>
  );
}

/* ── Download HTML report document ───────────────────────────────── */
function downloadReportDocument(result) {
  const { prediction, risk, risk_label, shap_values, explanation,
          disease, patient_values, report_id } = result;

  const DISEASE_NAMES = { diabetes:'Diabetes', heart:'Heart Disease', kidney:'Chronic Kidney Disease', liver:'Liver Disease' };
  const disName   = DISEASE_NAMES[disease] || disease;
  const riskPct   = Math.round(risk * 100);
  const outcome   = prediction === 1 ? 'Positive' : 'Negative';
  const riskLabel = risk_label === 'HIGH' ? 'High' : risk_label === 'MODERATE' ? 'Moderate' : 'Low';
  const today     = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
  const timeNow   = new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

  const riskColor = risk_label === 'HIGH' ? '#DC2626' : risk_label === 'MODERATE' ? '#D97706' : '#059669';
  const riskBg    = risk_label === 'HIGH' ? '#FEF2F2' : risk_label === 'MODERATE' ? '#FFFBEB' : '#F0FDF4';

  const LABELS = {
    Pregnancies:'Number of Pregnancies', Glucose:'Blood Sugar Level', BloodPressure:'Blood Pressure',
    SkinThickness:'Skin Fold Thickness', Insulin:'Insulin Level', BMI:'Body Mass Index',
    DiabetesPedigreeFunction:'Family Diabetes History', Age:'Age', age:'Age',
    sex:'Sex', cp:'Chest Pain Type', trestbps:'Resting Blood Pressure', chol:'Cholesterol Level',
    fbs:'High Fasting Blood Sugar', restecg:'ECG Result', thalach:'Max Heart Rate',
    exang:'Chest Pain on Exercise', oldpeak:'Stress Test Reading', slope:'Stress Test Pattern',
    ca:'Blocked Arteries', thal:'Blood Flow Status', bp:'Blood Pressure',
    sg:'Urine Concentration', al:'Protein in Urine', su:'Sugar in Urine',
    bgr:'Blood Glucose', bu:'Blood Urea', sc:'Creatinine', sod:'Sodium', pot:'Potassium',
    hemo:'Haemoglobin', pcv:'Red Cell %', wc:'White Blood Cells', rc:'Red Blood Cell Count',
    Total_Bilirubin:'Total Bilirubin', Direct_Bilirubin:'Direct Bilirubin',
    Alkaline_Phosphotase:'ALP', Alamine_Aminotransferase:'ALT',
    Aspartate_Aminotransferase:'AST', Total_Protiens:'Total Protein',
    Albumin:'Albumin', Albumin_and_Globulin_Ratio:'A/G Ratio',
  };

  const UNITS = {
    Glucose:'mg/dL', BloodPressure:'mm Hg', SkinThickness:'mm', Insulin:'μU/mL',
    trestbps:'mm Hg', chol:'mg/dL', thalach:'bpm', bp:'mm Hg', bgr:'mg/dL',
    bu:'mg/dL', sc:'mg/dL', sod:'mEq/L', pot:'mEq/L', hemo:'g/dL', pcv:'%',
    Age:'yrs', age:'yrs', Total_Bilirubin:'mg/dL', Direct_Bilirubin:'mg/dL',
    Alkaline_Phosphotase:'IU/L', Alamine_Aminotransferase:'IU/L',
    Aspartate_Aminotransferase:'IU/L', Total_Protiens:'g/dL', Albumin:'g/dL', wc:'cells/μL',
  };

  // Build parameter table rows
  const sortedShap = shap_values
    ? Object.entries(shap_values).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8)
    : [];
  const maxAbs = sortedShap.length ? Math.max(...sortedShap.map(([,v]) => Math.abs(v)), 0.001) : 1;

  const paramRows = sortedShap.map(([feat, val]) => {
    const up  = val >= 0;
    const abs = Math.abs(val);
    const pct = Math.round((abs / maxAbs) * 100);
    const statusColor = abs > 0.06 && up ? '#DC2626' : abs > 0.02 && up ? '#D97706' : abs > 0.06 && !up ? '#059669' : '#3B82F6';
    const statusText  = abs > 0.06 && up ? 'Elevated — primary concern' : abs > 0.02 && up ? 'Slightly elevated' : abs > 0.06 && !up ? 'Favourable — protective' : abs > 0.02 && !up ? 'Within normal range' : 'Minimal impact';
    const rawVal      = patient_values?.[feat];
    const displayVal  = rawVal !== undefined ? `${typeof rawVal === 'number' && !Number.isInteger(rawVal) ? rawVal.toFixed(1) : rawVal}${UNITS[feat] ? ' ' + UNITS[feat] : ''}` : '—';
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#334155">${LABELS[feat] || feat}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:700;color:#0F172A">${displayVal}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">
          <div style="height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${statusColor};border-radius:4px"></div>
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:12px;font-weight:600;color:${statusColor}">${statusText}</td>
      </tr>`;
  }).join('');

  // Format assessment text
  const assessmentHTML = explanation && !explanation.startsWith('__')
    ? explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    : '<p style="color:#92400E">Clinical assessment is currently unavailable. The risk score and parameter analysis above remain valid.</p>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Health Screening Report — ${report_id || 'N/A'}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#F8FAFC; color:#334155; }
  .page { max-width:820px; margin:0 auto; background:#fff; box-shadow:0 2px 24px rgba(0,0,0,0.08); }
  .header { background:#002875; color:#fff; padding:28px 36px 20px; }
  .header-title { font-size:22px; font-weight:900; letter-spacing:1px; }
  .header-sub { font-size:12px; color:#93C5FD; margin-top:2px; }
  .header-meta { display:flex; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.15); font-size:12px; color:#BFDBFE; flex-wrap:wrap; gap:8px; }
  .header-meta span { display:inline-block; margin-right:24px; }
  .header-meta strong { color:#fff; }
  .section-band { background:#003B8E; color:#fff; padding:7px 36px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; display:flex; align-items:center; gap:8px; }
  .section-num { width:20px; height:20px; border-radius:50%; background:rgba(255,255,255,0.2); display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; }
  .section-body { padding:20px 36px; }
  .verdict { background:${riskBg}; border-left:4px solid ${riskColor}; padding:14px 18px; border-radius:6px; display:flex; align-items:flex-start; gap:12px; }
  .verdict-icon { font-size:26px; }
  .verdict-title { font-size:15px; font-weight:800; color:${riskColor}; margin-bottom:4px; }
  .verdict-sub { font-size:13px; color:#475569; line-height:1.5; }
  .risk-row { display:flex; align-items:center; gap:24px; margin-top:8px; }
  .risk-score { font-size:48px; font-weight:900; color:${riskColor}; line-height:1; }
  .risk-label { display:inline-block; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:800; background:${riskBg}; color:${riskColor}; border:1px solid ${riskColor}; margin-top:6px; }
  .risk-bar-wrap { flex:1; }
  .risk-bar-track { height:10px; background:#E2E8F0; border-radius:5px; overflow:hidden; }
  .risk-bar-fill { height:100%; border-radius:5px; background:linear-gradient(90deg,${riskColor}88,${riskColor}); width:${riskPct}%; }
  .risk-scale { display:flex; justify-content:space-between; font-size:11px; color:#94A3B8; margin-top:4px; }
  .risk-note { font-size:11px; color:#94A3B8; margin-top:8px; font-style:italic; }
  table { width:100%; border-collapse:collapse; }
  th { padding:8px 12px; text-align:left; font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; border-bottom:2px solid #E2E8F0; }
  .assessment-box { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:18px; font-size:13px; line-height:1.8; color:#334155; }
  .recommendations ol { padding-left:20px; }
  .recommendations li { font-size:13px; color:#334155; margin-bottom:8px; line-height:1.6; }
  .footer { background:#F1F5F9; padding:20px 36px; border-top:2px solid #E2E8F0; }
  .footer-id { font-size:13px; font-weight:700; color:#475569; margin-bottom:4px; }
  .footer-date { font-size:12px; color:#94A3B8; margin-bottom:10px; }
  .disclaimer { font-size:11px; color:#94A3B8; line-height:1.6; border-top:1px solid #E2E8F0; padding-top:12px; }
  @media print { body{background:#fff} .page{box-shadow:none} }
  @page { margin:1.5cm; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:28px;margin-bottom:6px">🏥</div>
        <div class="header-title">HEALTH SCREENING REPORT</div>
        <div class="header-sub">Disease AI Elite — Clinical Screening Division</div>
      </div>
      <div style="text-align:right;font-size:12px;color:#BFDBFE">
        ${report_id ? `<div style="font-weight:800;color:#fff;margin-bottom:3px">${report_id}</div>` : ''}
        <div>Date: ${today}</div>
        <div>Time: ${timeNow}</div>
      </div>
    </div>
    <div class="header-meta">
      <span><strong>Screening:</strong> ${disName} Risk Assessment</span>
      <span><strong>Outcome:</strong> ${outcome}</span>
      <span><strong>Risk Level:</strong> ${riskLabel}</span>
      <span><strong>Risk Score:</strong> ${riskPct}%</span>
    </div>
  </div>

  <div class="section-band"><span class="section-num">1</span> Screening Outcome</div>
  <div class="section-body">
    <div class="verdict">
      <div class="verdict-icon">${prediction === 1 ? (risk_label === 'HIGH' ? '⚠️' : '🔶') : (risk_label === 'LOW' ? '✅' : '🔵')}</div>
      <div>
        <div class="verdict-title">${riskLabel} Risk${prediction === 1 ? ' Indicators Detected' : ' — Below Threshold'}</div>
        <div class="verdict-sub">
          ${prediction === 1
            ? 'Multiple health parameters fall outside the healthy range. We recommend consulting a doctor and sharing this report.'
            : 'Your values are generally within acceptable ranges. Continue with regular health check-ups.'}
        </div>
      </div>
    </div>
  </div>

  <div class="section-band"><span class="section-num">2</span> Risk Assessment</div>
  <div class="section-body">
    <div class="risk-row">
      <div>
        <div class="risk-score">${riskPct}%</div>
        <div class="risk-label">${riskLabel} Risk</div>
      </div>
      <div class="risk-bar-wrap">
        <div class="risk-bar-track"><div class="risk-bar-fill"></div></div>
        <div class="risk-scale"><span>0% — Very Low</span><span>50% — Moderate</span><span>100% — Very High</span></div>
        <div class="risk-note">Score reflects likelihood of disease based on values entered. This is not a medical diagnosis.</div>
      </div>
    </div>
  </div>

  ${sortedShap.length > 0 ? `
  <div class="section-band"><span class="section-num">3</span> Parameter Analysis</div>
  <div class="section-body">
    <p style="font-size:12px;color:#64748B;margin-bottom:14px">Parameters that most influenced your screening result, with observed values and clinical status.</p>
    <table>
      <thead>
        <tr>
          <th>Parameter</th><th>Your Value</th><th style="width:120px">Influence</th><th>Clinical Status</th>
        </tr>
      </thead>
      <tbody>${paramRows}</tbody>
    </table>
  </div>` : ''}

  <div class="section-band"><span class="section-num">${sortedShap.length > 0 ? '4' : '3'}</span> Clinical Assessment</div>
  <div class="section-body">
    <div class="assessment-box">${assessmentHTML}</div>
  </div>

  <div class="section-band"><span class="section-num">${sortedShap.length > 0 ? '5' : '4'}</span> Recommended Actions</div>
  <div class="section-body recommendations">
    <ol>
      <li>${prediction === 1 ? 'Schedule an appointment with your doctor and bring this printed report.' : 'Continue with regular health check-ups as recommended by your doctor.'}</li>
      <li>This report is for screening purposes only and does not replace a clinical diagnosis.</li>
      <li>If you experience any symptoms such as chest pain, breathlessness, or fatigue, seek medical attention immediately.</li>
      <li>Maintain a balanced diet, regular physical activity, adequate sleep, and avoid smoking or excessive alcohol.</li>
      <li>Discuss any values marked as "Elevated" or "Concerning" in the parameter table with your healthcare provider.</li>
    </ol>
  </div>

  <div class="footer">
    ${report_id ? `<div class="footer-id">Report No: ${report_id}</div>` : ''}
    <div class="footer-date">Generated on ${today} at ${timeNow} — Disease AI Elite Health Screening System</div>
    <div class="disclaimer">
      <strong>Medical Disclaimer:</strong> This report is generated for health screening and educational purposes only.
      It does not constitute a medical diagnosis, clinical opinion, or prescription.
      Always consult a qualified healthcare professional before making any medical decisions.
      Disease AI Elite accepts no liability for actions taken based on this report.
    </div>
  </div>

</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `health_report_${report_id || 'screening'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Download Excel records ───────────────────────────────────────── */
function downloadExcel() {
  fetch(`${API_BASE}/download-records`, { method: 'GET' })
    .then(r => {
      if (r.status === 404) throw new Error('no_records');
      if (!r.ok) throw new Error('server_error');
      return r.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = 'health_screening_records.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      if (err.message === 'no_records') {
        alert('No records saved yet.\n\nComplete at least one health screening first — the Excel file is created automatically after your first report.');
      } else {
        alert('Could not download records. Please make sure the backend server is running and try again.');
      }
    });
}

/* ── Main Report ──────────────────────────────────────────────────── */
export default function Result({ result, onReset }) {
  if (!result) return null;

  const { prediction, risk, risk_label, shap_values, explanation,
          disease, patient_values, report_id } = result;

  const riskPct  = Math.round(risk * 100);
  const colorKey = risk_label === 'HIGH' ? 'red' : risk_label === 'MODERATE' ? 'yellow' : 'green';
  const cfg      = (VERDICT[risk_label] || VERDICT.LOW)[prediction === 1 ? 'positive' : 'negative'];
  const disName  = DISEASE_NAMES[disease] || disease;
  const today    = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  const timeNow  = new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const riskLabel = risk_label === 'HIGH' ? 'High' : risk_label === 'MODERATE' ? 'Moderate' : 'Low';
  const outcomeText = prediction === 1 ? 'Positive' : 'Negative';

  const riskBadgeCls =
    colorKey === 'red'    ? 'bg-red-100 text-red-700 border-red-200' :
    colorKey === 'yellow' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-emerald-100 text-emerald-700 border-emerald-200';

  const explanationKind = classifyExplanation(explanation);
  const hasAssessment   = explanationKind === 'ok' && !!explanation;

  return (
    <div id="result-anchor" className="mt-6 result-reveal">
      <div className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-white">

        {/* ── Report Header ────────────────────────────────────────── */}
        <div className="bg-apollo-700 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">🏥</div>
              <div>
                <div className="text-white font-black text-lg leading-tight tracking-wide">HEALTH SCREENING REPORT</div>
                <div className="text-blue-200 text-xs mt-0.5">Disease AI Elite — Clinical Screening Division</div>
              </div>
            </div>
            <div className="text-right text-xs text-blue-200 space-y-0.5 shrink-0">
              {report_id && <div className="font-bold text-white">Report No: {report_id}</div>}
              <div>Date: {today}</div>
              <div>Time: {timeNow}</div>
            </div>
          </div>

          {/* Report summary strip */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label:'Screening Type', value:`${disName} Risk Assessment` },
              { label:'Outcome',        value:outcomeText },
              { label:'Risk Level',     value:riskLabel },
              { label:'Risk Score',     value:`${riskPct}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-blue-300 font-medium mb-0.5">{label}</div>
                <div className="text-white font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 1: Outcome ───────────────────────────────────── */}
        <SectionBand number="1" title="Screening Outcome" />
        <div className={`${cfg.bg} border-b ${cfg.border} px-6 py-5 flex items-start gap-4`}>
          <span className="text-3xl shrink-0 mt-0.5">{cfg.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-black text-base ${cfg.text}`}>{cfg.title}</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>{riskLabel} Risk</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{cfg.sub}</p>
          </div>
        </div>

        {/* ── Section 2: Risk Assessment ───────────────────────────── */}
        <SectionBand number="2" title="Risk Assessment" />
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <CircularGauge pct={riskPct} colorKey={colorKey} />
            </div>
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>0% — Very Low</span>
                <span>50% — Moderate</span>
                <span>100% — Very High</span>
              </div>
              <AnimBar pct={riskPct} colorKey={colorKey} />
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${riskBadgeCls}`}>{riskLabel} Risk</span>
                <span className="text-xs text-slate-400">· Overall screening result</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This score reflects the likelihood of disease based on the values entered.
                A higher score indicates a greater need for medical evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Parameter Analysis ───────────────────────── */}
        {shap_values && Object.keys(shap_values).length > 0 && (
          <>
            <SectionBand number="3" title="Parameter Analysis" />
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                The table below shows the parameters that most influenced your screening result,
                along with their observed values and clinical significance.
              </p>
              <ParameterAnalysis shapValues={shap_values} patientValues={patient_values} />
            </div>
          </>
        )}

        {/* ── Section 4: Clinical Assessment ──────────────────────── */}
        <SectionBand number={shap_values && Object.keys(shap_values).length > 0 ? '4' : '3'} title="Clinical Assessment" />
        <div className="px-6 py-5 border-b border-slate-100">
          {hasAssessment ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-apollo-100 text-apollo-700 flex items-center justify-center text-xs font-black">Rx</div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physician's Notes</span>
              </div>
              <AssessmentBox explanation={explanation} />
            </>
          ) : (
            <AssessmentBox explanation={explanation} />
          )}
        </div>

        {/* ── Section 5: Recommended Actions ──────────────────────── */}
        <SectionBand number={hasAssessment ? '5' : '4'} title="Recommended Actions" />
        <div className="px-6 py-5 border-b border-slate-100">
          <ul className="space-y-2">
            {[
              prediction === 1
                ? 'Schedule an appointment with your doctor and bring this report.'
                : 'Continue with regular health check-ups as recommended by your doctor.',
              'Do not use this report as a substitute for a clinical diagnosis.',
              'If you experience any symptoms, seek medical attention immediately.',
              'Maintain a balanced diet, regular physical activity, and adequate sleep.',
              'Discuss any abnormal values shown above with your healthcare provider.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-apollo-50 text-apollo-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Report Footer ────────────────────────────────────────── */}
        <div className="bg-slate-50 px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Primary: download the HTML report document */}
            <button
              onClick={() => downloadReportDocument(result)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-apollo-700 text-white font-bold text-sm
                         hover:bg-apollo-800 hover:shadow-md transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/>
              </svg>
              Download Report (Document)
            </button>
            {/* Secondary: download Excel records */}
            <button
              onClick={downloadExcel}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-emerald-600 text-white font-bold text-sm
                         hover:bg-emerald-700 hover:shadow-md transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Download All Records (Excel)
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="sm:w-44 py-3 rounded-xl border-2 border-slate-200 text-slate-600
                           font-bold text-sm hover:border-apollo-400 hover:text-apollo-700
                           hover:bg-white transition-all duration-200"
              >
                ← New Screening
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mb-3">
            📄 <strong className="text-slate-500">Download Report</strong> — saves this screening as a document you can print or share.<br/>
            📊 <strong className="text-slate-500">Download All Records</strong> — downloads the Excel file with every screening you have completed.
          </p>
          <div className="border-t border-slate-200 pt-4 text-center space-y-1">
            {report_id && <p className="text-xs font-bold text-slate-500">{report_id}</p>}
            <p className="text-xs text-slate-400">
              Generated on {today} at {timeNow} · Disease AI Elite — Health Screening System
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
              <strong className="text-slate-500">Disclaimer:</strong> This report is generated for screening purposes only
              and does not constitute a medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
