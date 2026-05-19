import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Form from './components/Form';
import Result from './components/Result';
import { ShieldIcon, DiabetesIcon, HeartIcon, KidneyIcon, LiverIcon } from './components/Icons';

/* ── Animated counter hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || typeof target !== 'number') return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round(easeOut(frame / totalFrames) * target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

/* ── Stat item with animated number ───────────────────────────────── */
function StatItem({ value, suffix, label, icon, delay, started }) {
  const num = useCountUp(typeof value === 'number' ? value : 0, 1600, started);
  return (
    <div className="text-center px-4 py-5 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl md:text-3xl font-black text-apollo-600">
        {typeof value === 'number' ? num : value}{suffix}
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

const STATS = [
  { value: 4,   suffix: '',   label: 'Diseases Screened',   icon: '🏥', delay: 0   },
  { value: 90,  suffix: '%+', label: 'Screening Accuracy',  icon: '🎯', delay: 120 },
  { value: 24,  suffix: '/7', label: 'Always Available',    icon: '⏰', delay: 240 },
  { value: 'Fast', suffix: '', label: 'Instant Reports',    icon: '📋', delay: 360 },
];

const HOW_IT_WORKS = [
  {
    step: '01', icon: '🏥', color: 'from-blue-500 to-blue-700',
    title: 'Choose Your Concern',
    desc: 'Select from Diabetes, Heart, Kidney, or Liver disease screening.',
  },
  {
    step: '02', icon: '📊', color: 'from-violet-500 to-violet-700',
    title: 'Enter Your Health Values',
    desc: 'Use simple sliders — every field shows whether your values are normal, borderline, or elevated.',
  },
  {
    step: '03', icon: '📋', color: 'from-emerald-500 to-emerald-700',
    title: 'Receive Your Health Report',
    desc: 'Get a complete screening report with risk assessment, clinical findings, and personalised recommendations.',
  },
];

/* ── App ───────────────────────────────────────────────────────────── */
export default function App() {
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [statsVisible, setStats]  = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStats(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Sticky Header ──────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-apollo-600 to-apollo-500 flex items-center justify-center shadow-md">
              <ShieldIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-apollo-700 text-base leading-none block">Disease AI Elite</span>
              <span className="text-xs text-slate-400 leading-none">Health Screening System</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              Live Screening
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              Screening Use Only
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              Trusted Health Screening System
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Know Your Health Risk<br />
              <span className="text-blue-300">with Confidence</span>
            </h1>
            <p className="text-blue-200 text-base md:text-lg leading-relaxed mb-7 max-w-md">
              Get instant risk screening with clear, plain-English reports for
              Diabetes, Heart Disease, Kidney & Liver conditions.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {['✓ 4 Disease Screenings', '✓ Instant Results', '✓ Detailed Health Report', '✓ Real-time Feedback'].map(f => (
                <span key={f} className="bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 cursor-default">
                  {f}
                </span>
              ))}
            </div>
            <a href="#screening"
               className="inline-flex items-center gap-2 bg-white text-apollo-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm">
              Start Screening
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { label:'Diabetes',       Icon:DiabetesIcon, color:'text-rose-500',   bg:'bg-rose-50',   cls:'float-a', stat:'Blood Sugar Screening' },
              { label:'Heart Disease',  Icon:HeartIcon,    color:'text-red-500',    bg:'bg-red-50',    cls:'float-b', stat:'Cardiac Risk Screening' },
              { label:'Kidney Disease', Icon:KidneyIcon,   color:'text-amber-600',  bg:'bg-amber-50',  cls:'float-c', stat:'Renal Health Screening' },
              { label:'Liver Disease',  Icon:LiverIcon,    color:'text-orange-600', bg:'bg-orange-50', cls:'float-d', stat:'Liver Health Screening' },
            ].map(({ label, Icon, color, bg, cls, stat }) => (
              <div key={label} className={`${cls} bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-white`}>
                <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm">{label}</div>
                <div className="text-blue-200 text-xs mt-0.5">{stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {STATS.map(s => <StatItem key={s.label} {...s} started={statsVisible} />)}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-center text-2xl font-black text-slate-800 mb-2">How It Works</h2>
        <p className="text-center text-slate-500 text-sm mb-8">Three simple steps to get your personalised health screening report</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map(({ step, icon, color, title, desc }, i) => (
            <div key={step}
                 className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm
                            hover:shadow-md hover:-translate-y-1 transition-all duration-300
                            animate-fade-in-up"
                 style={{ animationDelay: `${i * 120}ms` }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {icon}
              </div>
              <div className="text-xs font-black text-slate-300 mb-1">STEP {step}</div>
              <h3 className="font-black text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Screening Form + Result ─────────────────────────────────── */}
      <section id="screening" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <Form onResult={setResult} onError={setError} onLoading={setLoading} />

        {error && (
          <div className="mt-3 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-in">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7.5a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
            </svg>
            {error}
          </div>
        )}

        {!loading && result && (
          <Result
            result={result}
            onReset={() => {
              setResult(null);
              window.scrollTo({ top: document.getElementById('screening')?.offsetTop - 80, behavior: 'smooth' });
            }}
          />
        )}
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-apollo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ShieldIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">Disease AI Elite</div>
              <div className="text-blue-200 text-xs">Advanced Health Screening System</div>
            </div>
          </div>
          <p className="text-blue-200 text-xs text-center max-w-md leading-relaxed">
            <strong className="text-white">Medical Disclaimer:</strong> For screening and educational purposes only.
            Not a substitute for professional medical advice, diagnosis, or treatment.
            Always consult a qualified healthcare professional.
          </p>
          <div className="text-blue-300 text-xs">© 2026 Disease AI Elite</div>
        </div>
      </footer>
    </div>
  );
}
