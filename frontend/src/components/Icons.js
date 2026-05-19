/* Medical SVG icon components — all accept className prop */

export const DiabetesIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="currentColor" opacity="0.08"/>
    {/* Blood drop */}
    <path d="M28 10C28 10 16 24 16 33a12 12 0 0024 0C40 24 28 10 28 10z"
          fill="currentColor" opacity="0.18"/>
    <path d="M28 14C28 14 18 26 18 33a10 10 0 0020 0C38 26 28 14 28 14z"
          stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* Glucose plus symbol */}
    <line x1="23" y1="33" x2="33" y2="33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="28" y1="28" x2="28" y2="38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

export const HeartIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="currentColor" opacity="0.08"/>
    {/* Heart shape */}
    <path d="M28 42l-2.2-2C14 29 8 24.4 8 18.5A9.5 9.5 0 0128 14a9.5 9.5 0 0120 4.5C48 24.4 42 29 30.2 40l-2.2 2z"
          fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* ECG / pulse line */}
    <polyline points="12,26 17,26 20,20 23,32 27,16 31,30 34,24 39,24 43,26"
              stroke="white" strokeWidth="1.8" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const KidneyIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="currentColor" opacity="0.08"/>
    {/* Left kidney */}
    <path d="M22 14c-6 0-10 5-10 11 0 7 3 11 7 15 2 2 4 4 7 4s5-3 5-6v-4c0-2 2-3 4-3 3 0 5-3 5-7s-3-7-7-7c-3 0-5 2-7 4-1 1-2 2-4 3z"
          fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Right kidney (mirrored) */}
    <path d="M34 14c6 0 10 5 10 11 0 7-3 11-7 15-2 2-4 4-7 4s-5-3-5-6v-4c0-2-2-3-4-3-3 0-5-3-5-7s3-7 7-7c3 0 5 2 7 4 1 1 2 2 4 3z"
          fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
  </svg>
);

export const LiverIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="28" fill="currentColor" opacity="0.08"/>
    {/* Liver silhouette */}
    <path d="M10 28C10 16 17 8 26 8c5 0 9 2 12 7 3-1 7 1 9 5s1 8-3 10l-4 2c0 5-3 9-8 11-2 1-4 2-6 2C16 45 10 37 10 28z"
          fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Internal texture lines */}
    <path d="M20 22c0 0 3 4 9 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M17 30c0 0 3 6 11 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
    <circle cx="37" cy="17" r="2.5" fill="currentColor" opacity="0.35"/>
  </svg>
);

export const ShieldIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <path d="M16 3l11 4v8c0 6-5 11-11 14C10 26 5 21 5 15V7l11-4z"
          fill="white" opacity="0.15" stroke="white" strokeWidth="1.5"/>
    <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="10" y1="16" x2="22" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const BrainIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M9.5 2A2.5 2.5 0 007 4.5V5a3 3 0 00-3 3 2 2 0 000 4 3 3 0 003 3v.5A2.5 2.5 0 009.5 18h5a2.5 2.5 0 002.5-2.5V15a3 3 0 003-3 2 2 0 000-4 3 3 0 00-3-3v-.5A2.5 2.5 0 0014.5 2h-5z"
          stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 6v12M8 9c0 0 1.5 1 4 1s4-1 4-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const ChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="10" y="7"  width="4" height="14" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="17" y="3"  width="4" height="18" rx="1" fill="currentColor"/>
  </svg>
);

export const CheckCircle = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 12l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WarnIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M10.3 3.5l-7.6 14A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 3.5a2 2 0 00-3.4 0z"
          fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="9"  x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor"/>
  </svg>
);

export const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
