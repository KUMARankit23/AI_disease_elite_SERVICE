/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apollo: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#0052CC",
          600: "#003B8E",
          700: "#002875",
          800: "#001D5A",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        slideRight: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--target-width)" },
        },
        scaleIn: {
          "0%":   { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        pulse2: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(0,82,204,0.3)" },
          "50%":     { boxShadow: "0 0 0 10px rgba(0,82,204,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.55s ease-out both",
        "fade-in":     "fadeIn 0.4s ease-out both",
        "float":       "float 3s ease-in-out infinite",
        "float-delay": "float 3s ease-in-out 0.8s infinite",
        "float-slow":  "float 4s ease-in-out 0.4s infinite",
        "scale-in":    "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "pulse-ring":  "pulse2 2s ease-in-out infinite",
        "shimmer":     "shimmer 2s linear infinite",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
