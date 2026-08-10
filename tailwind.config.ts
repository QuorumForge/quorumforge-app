import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070708",
        surface: {
          DEFAULT: "#111113",
          elevated: "#18181b",
          hover: "#1f1f23",
        },
        border: {
          DEFAULT: "#27272a",
          subtle: "#1c1c1f",
        },
        primary: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          muted: "#8B5CF6",
          foreground: "#FFFFFF",
        },
        stellar: {
          DEFAULT: "#14B6E7",
          muted: "#0EA5C9",
        },
        amber: {
          DEFAULT: "#F59E0B",
          foreground: "#000000",
        },
        emerald: {
          DEFAULT: "#34D399",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#18181b",
          foreground: "#71717a",
        },
        foreground: "#FAFAFA",
        "foreground-secondary": "#A1A1AA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(139, 92, 246, 0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 24px -4px rgba(0,0,0,0.5)",
        "card-hover":
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 32px -8px rgba(139, 92, 246, 0.15)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(20, 182, 231, 0.08), transparent)",
        "board-hero":
          "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(20, 182, 231, 0.06) 50%, transparent 100%)",
      },
      animation: {
        "progress-fill": "progressFill 1.2s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
      keyframes: {
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
