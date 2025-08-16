const { withUt } = require("uploadthing/tw");

/** @type {import('tailwindcss').Config} */



module.exports = withUt({
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx,mdx}',
	],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SISTEMA DE TOKENS UNIFICADO BASADO EN SIDEBAR
        "app": {
          primary: "var(--app-primary)",
          "primary-dark": "var(--app-primary-dark)",
          "primary-light": "var(--app-primary-light)",
          accent: "var(--app-accent)",
          surface: "var(--app-surface)",
          border: "var(--app-border)",
          "text-primary": "var(--app-text-primary)",
          "text-secondary": "var(--app-text-secondary)",
          "text-muted": "var(--app-text-muted)",
          hover: "var(--app-hover)",
          active: "var(--app-active)",
        },
        // COMPATIBILIDAD CON PALETA ANTERIOR
        "brand-primary": "#1E3A2B",
        "brand-accent": "#8CC63F",
        "bg-base": "#FCFCF8",
        "bg-card": "#FCFCF8",
        "text-heading": "#212529",
        "text-body": "#343A40",
        "text-link": "#1E3A2B",
        "border-default": "#DEE2E6",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      spacing: {
        "1.5": "0.375rem", // 6px
        "2.5": "0.625rem", // 10px
        "3.5": "0.875rem", // 14px
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }], // 10px
        xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],       // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      },
      fontFamily: {
        sans: ['Montserrat', 'Renogare Soft', 'ChaletBook', 'sans-serif'],
        display: ['Renogare Soft', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        "app": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "app-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "app-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "app-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
});
