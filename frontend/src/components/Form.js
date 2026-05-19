import React, { useState, useEffect, useCallback } from 'react';
import { DiabetesIcon, HeartIcon, KidneyIcon, LiverIcon, SpinnerIcon } from './Icons';
import API_BASE from '../api';

/* ── Disease config ─────────────────────────────────────────────── */
const DISEASES = [
  { key:'diabetes', label:'Diabetes',       sub:'Blood sugar screening',  Icon:DiabetesIcon, color:'text-rose-500',   ring:'ring-rose-400',   bg:'bg-rose-50',   active:'border-rose-400 bg-rose-50'   },
  { key:'heart',    label:'Heart Disease',  sub:'Cardiac risk screening', Icon:HeartIcon,    color:'text-red-500',    ring:'ring-red-400',    bg:'bg-red-50',    active:'border-red-400 bg-red-50'     },
  { key:'kidney',   label:'Kidney Disease', sub:'Renal function check',   Icon:KidneyIcon,   color:'text-amber-600',  ring:'ring-amber-400',  bg:'bg-amber-50',  active:'border-amber-400 bg-amber-50' },
  { key:'liver',    label:'Liver Disease',  sub:'Liver health screening', Icon:LiverIcon,    color:'text-orange-600', ring:'ring-orange-400', bg:'bg-orange-50', active:'border-orange-400 bg-orange-50'},
];

/* ── Feature metadata (all 4 diseases) ─────────────────────────── */
const META = {
  /* ── DIABETES ── */
  Pregnancies:              { label:'How Many Times Have You Been Pregnant?', unit:'times',  type:'slider',  min:0,    max:17,    step:1,    normal:[0,6],       desc:'Enter the total number of pregnancies. This helps assess diabetes risk as more pregnancies can affect blood sugar regulation.',                                              lo:'None',            hi:'17+' },
  Glucose:                  { label:'Blood Sugar Level (Fasting)',            unit:'mg/dL',  type:'slider',  min:0,    max:300,   step:1,    normal:[70,140],    desc:'The amount of sugar in your blood after not eating for several hours. A healthy level is below 100. Above 126 usually means diabetes.',                                    lo:'Very Low',        hi:'Very High' },
  BloodPressure:            { label:'Blood Pressure (Bottom Number)',         unit:'mm Hg',  type:'slider',  min:0,    max:200,   step:1,    normal:[60,80],     desc:'The lower number in a blood pressure reading (e.g. the "80" in 120/80). A healthy range is 60–80. Higher values mean your heart is working harder.',                     lo:'Too Low',         hi:'Too High' },
  SkinThickness:            { label:'Arm Skin Fold Thickness',                unit:'mm',     type:'slider',  min:0,    max:100,   step:1,    normal:[10,35],     desc:'A simple body-fat measurement taken by pinching the skin at the back of your upper arm. Higher values suggest more body fat.',                                              lo:'Very Thin',       hi:'Very Thick' },
  Insulin:                  { label:'Insulin Level in Blood',                 unit:'μU/mL',  type:'slider',  min:0,    max:850,   step:1,    normal:[16,166],    desc:'Insulin is a hormone that helps your body use sugar. Levels are measured 2 hours after eating. Very high or very low levels are concerning.',                             lo:'Very Low',        hi:'Very High' },
  BMI:                      { label:'Body Mass Index (BMI)',                  unit:'',       type:'slider',  min:10,   max:70,    step:0.1,  normal:[18.5,24.9], desc:'A measure of body weight relative to height. Below 18.5 = underweight · 18.5–24.9 = healthy · 25–29.9 = overweight · 30 and above = obese.',                            lo:'Underweight',     hi:'Obese' },
  DiabetesPedigreeFunction: { label:'Family History of Diabetes',             unit:'score',  type:'slider',  min:0.05, max:2.5,   step:0.01, normal:[0.05,0.5],  desc:'A score showing how strong your family history of diabetes is. A low score (near 0) means little or no family history. A high score (near 2.5) means close relatives had diabetes.', lo:'No family history',hi:'Strong history' },
  Age:                      { label:'Age',                                    unit:'years',  type:'slider',  min:1,    max:100,   step:1,    normal:[1,45],      desc:'Your current age in years. The risk of type 2 diabetes increases with age, especially after 45.',                                                                         lo:'Young',           hi:'Older' },
  /* ── HEART ── */
  age:      { label:'Age',                                      unit:'years',  type:'slider',  min:20,  max:90,  step:1,   normal:[20,55],   desc:'Your age in years. Heart disease risk increases significantly after age 55.',                                                                                         lo:'Young',           hi:'Older' },
  sex:      { label:'Sex',                                      unit:'',       type:'options', options:[{value:0,label:'♀ Female'},{value:1,label:'♂ Male'}],                                                                                                                                         desc:'Your biological sex. Men tend to develop heart disease at younger ages than women.' },
  cp:       { label:'Do You Experience Chest Pain?',            unit:'',       type:'options', options:[{value:0,label:'Yes — pressure/tightness during activity'},{value:1,label:'Yes — unusual or mild chest pain'},{value:2,label:'Yes — but not heart-related'},{value:3,label:'No chest pain'}],  desc:'Describe any chest pain or discomfort you feel. Chest pressure or tightness during activity is the most common sign of heart problems.' },
  trestbps: { label:'Resting Blood Pressure',                   unit:'mm Hg',  type:'slider',  min:80,  max:220, step:1,   normal:[90,120],  desc:'Your blood pressure when you are calm and resting. A healthy reading is below 120. Above 130 is considered elevated.',                                               lo:'Low',             hi:'Very High' },
  chol:     { label:'Cholesterol Level in Blood',               unit:'mg/dL',  type:'slider',  min:100, max:600, step:1,   normal:[100,200], desc:'The total amount of cholesterol in your blood. Below 200 is healthy. Above 240 is high and increases heart disease risk.',                                         lo:'Low',             hi:'Very High' },
  fbs:      { label:'Is Your Fasting Blood Sugar Above Normal?',unit:'',       type:'options', options:[{value:0,label:'✅ No — it is normal (120 mg/dL or below)'},{value:1,label:'⚠️ Yes — it is high (above 120 mg/dL)'}],                                                                          desc:'This checks if your blood sugar is too high when you have not eaten. High fasting blood sugar raises the risk of heart disease.' },
  restecg:  { label:'Heart Electrical Test (ECG) Result',       unit:'',       type:'options', options:[{value:0,label:'Normal — no issues found'},{value:1,label:'Minor irregularity detected'},{value:2,label:'Significant abnormality or enlarged heart'}],                                        desc:'An ECG (electrocardiogram) measures the electrical activity of your heart at rest. Select the result from your most recent test.' },
  thalach:  { label:'Highest Heart Rate Achieved',              unit:'bpm',    type:'slider',  min:60,  max:210, step:1,   normal:[150,210], desc:'The fastest heart rate (beats per minute) you reached during exercise or a treadmill stress test. A lower maximum rate can be a sign of heart problems.', lo:'Low (concern)',   hi:'High (healthy)' },
  exang:    { label:'Do You Get Chest Pain During Exercise?',   unit:'',       type:'options', options:[{value:0,label:'✅ No — I exercise without chest pain'},{value:1,label:'⚠️ Yes — I feel chest pain or tightness during exercise'}],                                                            desc:'Feeling chest pain, tightness, or discomfort during physical activity is one of the most important warning signs of heart disease.' },
  oldpeak:  { label:'Stress Test Drop Reading',                 unit:'',       type:'slider',  min:0,   max:7,   step:0.1, normal:[0,1],     desc:'A value from a heart stress test that shows how much the heart struggled during exercise. A reading of 0 is normal. Above 2 is a concern.',                        lo:'Normal (0)',       hi:'Abnormal (7)' },
  slope:    { label:'Heart Stress Test Pattern',                unit:'',       type:'options', options:[{value:0,label:'Improving — heart recovers well'},{value:1,label:'Flat — heart shows little change'},{value:2,label:'Worsening — heart struggles under stress'}],                             desc:'This shows how your heart rate changes during the peak of a stress test. An improving pattern is healthy; worsening means the heart is under stress.' },
  ca:       { label:'Number of Narrowed Heart Arteries',        unit:'',       type:'options', options:[{value:0,label:'0 — None (healthy)'},{value:1,label:'1 artery narrowed'},{value:2,label:'2 arteries narrowed'},{value:3,label:'3 arteries narrowed'}],                                       desc:'The number of main heart arteries that are partially blocked (found on an X-ray or scan). More blocked arteries means a higher risk of heart attack.' },
  thal:     { label:'Heart Blood Flow Test Result',             unit:'',       type:'options', options:[{value:0,label:'Normal — blood flows well'},{value:1,label:'Permanent blockage in blood flow'},{value:2,label:'Temporary blockage — improves at rest'},{value:3,label:'Other finding'}],     desc:'This test shows how well blood flows through your heart muscle. A permanent blockage is more serious than a temporary one that improves with rest.' },
  /* ── KIDNEY ── */
  bp:   { label:'Blood Pressure',                               unit:'mm Hg',        type:'slider', min:40,    max:200,   step:1,    normal:[60,80],    desc:'Your blood pressure reading. High blood pressure is one of the leading causes of kidney damage. A healthy reading is below 80 (lower number).',               lo:'Too Low',         hi:'Too High' },
  sg:   { label:'How Concentrated Is Your Urine?',              unit:'sp. gravity',  type:'slider', min:1.000, max:1.030, step:0.001,normal:[1.010,1.025],desc:'This shows how well your kidneys are concentrating urine. Healthy urine is moderately concentrated (1.010–1.025). Very dilute urine may mean the kidneys are not working well.', lo:'Too Watery',      hi:'Too Concentrated' },
  al:   { label:'Protein Found in Urine',                       unit:'0–5 scale',    type:'slider', min:0,     max:5,     step:1,    normal:[0,1],      desc:'Healthy urine should have no protein. Any protein in urine (score above 0) is an early warning sign that the kidneys may be leaking.',                             lo:'None (healthy)',  hi:'Large amount' },
  su:   { label:'Sugar Found in Urine',                         unit:'0–5 scale',    type:'slider', min:0,     max:5,     step:1,    normal:[0,0],      desc:'There should be no sugar in healthy urine. Sugar in urine (score above 0) often means uncontrolled diabetes, which damages the kidneys.',                          lo:'None (normal)',   hi:'High' },
  bgr:  { label:'Blood Sugar Level',                            unit:'mg/dL',        type:'slider', min:20,    max:500,   step:1,    normal:[70,140],   desc:'The amount of sugar in your blood. A healthy level is 70–140 mg/dL. Consistently high blood sugar damages the kidneys over time.',                               lo:'Too Low',         hi:'Very High' },
  bu:   { label:'Blood Waste Level (Urea)',                     unit:'mg/dL',        type:'slider', min:1,     max:400,   step:1,    normal:[7,25],     desc:'Urea is a waste product that healthy kidneys filter out of the blood. A high urea level (above 25) means your kidneys are not cleaning the blood properly.',      lo:'Normal',          hi:'Very High' },
  sc:   { label:'Kidney Filter Efficiency (Creatinine)',        unit:'mg/dL',        type:'slider', min:0.4,   max:80,    step:0.1,  normal:[0.6,1.2],  desc:'Creatinine is a waste product from muscles. Healthy kidneys remove it efficiently. A level above 1.2 mg/dL is a strong sign that the kidneys are not working well.', lo:'Normal',          hi:'Severely High' },
  sod:  { label:'Salt (Sodium) Level in Blood',                 unit:'mEq/L',        type:'slider', min:100,   max:170,   step:1,    normal:[135,145],  desc:'Sodium (salt) in your blood helps balance fluids. A healthy level is 135–145. A very low level can be a sign of advanced kidney disease.',                         lo:'Too Low',         hi:'Too High' },
  pot:  { label:'Potassium Level in Blood',                     unit:'mEq/L',        type:'slider', min:2,     max:50,    step:0.1,  normal:[3.5,5.0],  desc:'Potassium helps your heart and muscles work. A healthy level is 3.5–5.0. Very high potassium is a dangerous sign of kidney failure.',                              lo:'Too Low',         hi:'Dangerously High' },
  hemo: { label:'Haemoglobin (Oxygen in Blood)',                unit:'g/dL',         type:'slider', min:3,     max:20,    step:0.1,  normal:[12,17],    desc:'Haemoglobin carries oxygen around your body. Low haemoglobin means anaemia (tiredness, weakness), which is very common when kidneys are not working well.',       lo:'Low (anaemia)',   hi:'Normal' },
  pcv:  { label:'Percentage of Red Cells in Blood',             unit:'%',            type:'slider', min:5,     max:60,    step:1,    normal:[36,50],    desc:'Shows what percentage of your blood is made up of red blood cells. Below 36% means anaemia. Anaemia is common in kidney disease.',                                   lo:'Too Low',         hi:'Normal' },
  wc:   { label:'White Blood Cell Count (Infection Fighter)',   unit:'cells/μL',     type:'slider', min:2000,  max:30000, step:100,  normal:[4000,11000],desc:'White blood cells fight infection. A normal count is 4,000–11,000. A very high count may mean there is an infection or inflammation affecting the kidneys.',       lo:'Low',             hi:'Very High' },
  rc:   { label:'Red Blood Cell Count',                         unit:'million/μL',   type:'slider', min:1,     max:9,     step:0.1,  normal:[4.0,6.0],  desc:'The number of red blood cells in your blood. A low count means anaemia, which is very common in people with kidney disease.',                                        lo:'Too Low',         hi:'Normal' },
  /* ── LIVER ── */
  Total_Bilirubin:            { label:'Jaundice Indicator (Total Bilirubin)',  unit:'mg/dL', type:'slider', min:0,   max:80,   step:0.1, normal:[0,1.2],    desc:'Bilirubin is a yellow substance made when red blood cells break down. High levels cause yellow skin or eyes (jaundice) and indicate liver problems. Healthy level is below 1.2.',                            lo:'Normal',     hi:'Severely High' },
  Direct_Bilirubin:           { label:'Direct Bilirubin Level',                unit:'mg/dL', type:'slider', min:0,   max:25,   step:0.1, normal:[0,0.3],    desc:'This is a specific type of bilirubin that the liver processes. A level above 0.3 mg/dL suggests the liver or bile ducts are not working correctly.',                                                         lo:'Normal',     hi:'High' },
  Alkaline_Phosphotase:       { label:'Liver Enzyme Level (ALP)',               unit:'IU/L',  type:'slider', min:60,  max:2200, step:1,   normal:[44,147],   desc:'ALP is an enzyme found in the liver. When the liver or bile ducts are damaged or blocked, ALP leaks into the blood and levels rise. A healthy level is 44–147 IU/L.',                                    lo:'Normal',     hi:'Very High' },
  Alamine_Aminotransferase:   { label:'Liver Cell Damage Marker (ALT)',         unit:'IU/L',  type:'slider', min:5,   max:2000, step:1,   normal:[7,56],     desc:'ALT is an enzyme inside liver cells. When liver cells are damaged (by alcohol, infection, or disease), ALT spills into the blood. A healthy level is below 56 IU/L.',                                       lo:'Normal',     hi:'Very High' },
  Aspartate_Aminotransferase: { label:'Liver & Heart Stress Marker (AST)',      unit:'IU/L',  type:'slider', min:5,   max:5000, step:1,   normal:[10,40],    desc:'AST is an enzyme found in the liver and heart. Elevated levels indicate liver damage or heart stress. A healthy level is below 40 IU/L.',                                                              lo:'Normal',     hi:'Very High' },
  Total_Protiens:             { label:'Total Protein in Blood',                 unit:'g/dL',  type:'slider', min:2,   max:10,   step:0.1, normal:[6.0,8.3],  desc:'The liver produces most of the proteins in your blood. A low protein level (below 6.0 g/dL) suggests the liver is not functioning well.',                                                             lo:'Too Low',    hi:'High' },
  Albumin:                    { label:'Albumin (Main Protein Made by Liver)',   unit:'g/dL',  type:'slider', min:0.5, max:6,    step:0.1, normal:[3.5,5.5],  desc:'Albumin is the most important protein made by the liver. A level below 3.5 g/dL is a sign of chronic liver disease or poor nutrition.',                                                              lo:'Too Low',    hi:'Normal' },
  Albumin_and_Globulin_Ratio: { label:'Protein Balance in Blood (A/G Ratio)',  unit:'',      type:'slider', min:0.1, max:3,    step:0.1, normal:[1.1,2.5],  desc:'This compares two types of blood protein (albumin and globulin). A healthy ratio is 1.1–2.5. A low ratio (below 1.0) often points to chronic liver disease or inflammation.',                             lo:'Low',        hi:'Normal' },
};

/* ── Helpers ──────────────────────────────────────────────────────── */
function getStatus(val, meta) {
  if (!meta.normal || meta.type !== 'slider') return null;
  const [lo, hi] = meta.normal;
  const range = (meta.max - meta.min) || 1;
  const border = range * 0.12;
  if (val >= lo && val <= hi) return { label:'Normal',       cls:'pill-normal' };
  if (val < lo)  return (lo - val) <= border ? { label:'Slightly Low', cls:'pill-border' } : { label:'Low',      cls:'pill-low'    };
  return            (val - hi) <= border     ? { label:'Borderline',   cls:'pill-border' } : { label:'High ⚠',  cls:'pill-high'   };
}

function sliderBg(val, meta) {
  const pct = Math.max(0, Math.min(100, ((val - meta.min) / (meta.max - meta.min)) * 100));
  const [lo, hi] = meta.normal || [meta.min, meta.max];
  const inNormal = val >= lo && val <= hi;
  const color = inNormal ? '#0052CC' : val < lo ? '#0EA5E9' : '#EF4444';
  return `linear-gradient(to right, ${color} ${pct}%, #E2E8F0 ${pct}%)`;
}

/* ── SliderField ──────────────────────────────────────────────────── */
function SliderField({ feature, meta, value, onChange, idx }) {
  const num    = parseFloat(value ?? meta.min);
  const status = getStatus(num, meta);
  const dec    = meta.step < 0.01 ? 3 : meta.step < 0.1 ? 2 : meta.step < 1 ? 1 : 0;
  const display = dec === 0 ? Math.round(num) : num.toFixed(dec);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4
                    hover:shadow-md hover:border-blue-200 focus-within:border-blue-400
                    focus-within:ring-2 focus-within:ring-blue-100
                    transition-all duration-200 animate-fade-in-up"
         style={{ animationDelay: `${idx * 40}ms` }}>

      {/* Header */}
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <div className="text-sm font-semibold text-slate-800 leading-tight">{meta.label}</div>
          {meta.unit && <div className="text-xs text-slate-400 mt-0.5">{meta.unit}</div>}
        </div>
        {status && <span className={status.cls}>{status.label}</span>}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{meta.desc}</p>

      {/* Slider + value */}
      <div className="flex items-center gap-3 mb-1">
        <input
          type="range"
          className="range-slider flex-1"
          min={meta.min} max={meta.max} step={meta.step}
          value={num}
          onChange={e => onChange(feature, e.target.value)}
          style={{ background: sliderBg(num, meta) }}
        />
        <div className="min-w-[52px] text-right font-bold text-apollo-600 text-sm tabular-nums">{display}</div>
      </div>
      <div className="flex justify-between text-xs text-slate-300">
        <span>{meta.lo}</span><span>{meta.hi}</span>
      </div>
    </div>
  );
}

/* ── OptionsField ─────────────────────────────────────────────────── */
function OptionsField({ feature, meta, value, onChange, idx }) {
  const selected = value !== undefined && value !== '' ? parseFloat(value) : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4
                    hover:shadow-md hover:border-blue-200
                    transition-all duration-200 animate-fade-in-up"
         style={{ animationDelay: `${idx * 40}ms` }}>

      <div className="text-sm font-semibold text-slate-800 mb-1">{meta.label}</div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{meta.desc}</p>

      <div className="flex flex-wrap gap-2">
        {meta.options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(feature, opt.value)}
            className={`flex-1 min-w-[80px] text-xs font-semibold py-2 px-2 rounded-lg border
                        transition-all duration-150
                        ${selected === opt.value
                          ? 'bg-apollo-600 text-white border-apollo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────── */
function ProgressBar({ filled, total }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const color = pct === 100 ? 'bg-emerald-500' : 'bg-apollo-500';
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-5">
      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width:`${pct}%` }} />
      </div>
      <span className={`text-xs font-bold whitespace-nowrap ${pct === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
        {pct === 100 ? '✓ All fields ready' : `${filled} / ${total} fields filled`}
      </span>
    </div>
  );
}

/* ── Main Form ────────────────────────────────────────────────────── */
export default function Form({ onResult, onError, onLoading }) {
  const [disease, setDisease]   = useState('diabetes');
  const [features, setFeatures] = useState([]);
  const [values, setValues]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({});

  const fetchFeatures = useCallback((d) => {
    fetch(`${API_BASE}/features/${d}`)
      .then(r => r.json())
      .then(data => {
        setFeatures(data.features);
        const defs = {};
        data.features.forEach(f => {
          const m = META[f];
          if (m?.type === 'slider') {
            const mid = (m.min + m.max) / 2;
            const dec = m.step < 0.01 ? 3 : m.step < 0.1 ? 2 : m.step < 1 ? 1 : 0;
            defs[f] = mid.toFixed(dec);
          }
        });
        setValues(defs);
        setTouched({});
      })
      .catch(() => setFeatures([]));
  }, []);

  useEffect(() => {
    setValues({}); onResult(null);
    fetchFeatures(disease);
  }, [disease, fetchFeatures]); // eslint-disable-line

  function handleChange(f, v) {
    setValues(p => ({ ...p, [f]: v }));
    setTouched(p => ({ ...p, [f]: true }));
  }

  // Count how many option-type fields are filled (sliders are always filled)
  const optionFeatures  = features.filter(f => META[f]?.type === 'options');
  const filledOptions   = optionFeatures.filter(f => values[f] !== undefined && values[f] !== '').length;
  const sliderFeatures  = features.filter(f => META[f]?.type === 'slider');
  const totalFilled     = sliderFeatures.length + filledOptions;
  const total           = features.length;

  async function handleSubmit(e) {
    e.preventDefault();
    onError(null);

    const missing = features.filter(f => values[f] === undefined || values[f] === '');
    if (missing.length) {
      onError(`Please complete: ${missing.map(f => META[f]?.label || f).join(', ')}`);
      return;
    }
    const arr = features.map(f => parseFloat(values[f]));
    if (arr.some(isNaN)) { onError('Some values are invalid. Please check all fields.'); return; }

    setLoading(true); onLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/predict`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ disease, values: arr }),
      });
      const json = await res.json();
      if (!res.ok) onError(json.detail || 'Prediction failed.');
      else {
        onResult(json);
        setTimeout(() => document.getElementById('result-anchor')?.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
      }
    } catch { onError('Cannot reach the server. Make sure the backend is running on port 8000.'); }
    finally { setLoading(false); onLoading(false); }
  }

  return (
    <div className="space-y-5">

      {/* ── Step 1: Disease selector ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="section-label">
          <span className="w-6 h-6 rounded-full bg-apollo-600 text-white text-xs font-black flex items-center justify-center">1</span>
          Select Disease to Screen For
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DISEASES.map(({ key, label, sub, Icon, color, bg, active }) => {
            const isActive = disease === key;
            return (
              <button
                key={key} type="button"
                onClick={() => { setDisease(key); onResult(null); onError(null); }}
                className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200
                            ${isActive
                              ? `${active} card-glow`
                              : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'}`}
              >
                {/* Check badge */}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-apollo-600 rounded-full flex items-center justify-center animate-scale-in">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-3
                                 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className={`font-bold text-sm ${isActive ? 'text-apollo-700' : 'text-slate-800'}`}>{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Patient values ───────────────────────────────── */}
      {features.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="section-label">
            <span className="w-6 h-6 rounded-full bg-apollo-600 text-white text-xs font-black flex items-center justify-center">2</span>
            Enter Your Health Values
            <span className="ml-auto text-slate-400 font-normal normal-case tracking-normal">{features.length} fields</span>
          </div>

          {/* Progress */}
          <ProgressBar filled={totalFilled} total={total} />

          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
              {features.map((f, i) => {
                const m = META[f];
                if (!m) return null;
                return m.type === 'options'
                  ? <OptionsField key={f} feature={f} meta={m} value={values[f]} onChange={handleChange} idx={i} />
                  : <SliderField  key={f} feature={f} meta={m} value={values[f]} onChange={handleChange} idx={i} />;
              })}
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button type="submit" className="btn-apollo" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinnerIcon className="w-5 h-5 text-white" />
                    Preparing your health report…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                    Generate Health Report
                  </span>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                Your report will include a risk score, parameter analysis, and clinical recommendations
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
