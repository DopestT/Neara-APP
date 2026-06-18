import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        ember: "hsl(var(--ember))",
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      backgroundImage: {
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-glow': 'var(--gradient-glow)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-warm': 'var(--gradient-warm)',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        ember: 'var(--shadow-ember)',
        soft: 'var(--shadow-soft)',
        elev: 'var(--shadow-elev)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "stamp-in": {
          "0%": { transform: "scale(3) rotate(-25deg)", opacity: "0" },
          "60%": { transform: "scale(0.9) rotate(-5deg)", opacity: "1" },
          "80%": { transform: "scale(1.08) rotate(0deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "ripple": {
          "0%": { transform: "scale(0.4)", opacity: "0.7" },
          "100%": { transform: "scale(3)", opacity: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.95" },
          "50%": { transform: "scale(1.025)", opacity: "1" },
        },
        "soft-confirm": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.55)", transform: "scale(1)" },
          "60%": { boxShadow: "0 0 0 22px hsl(var(--primary) / 0)", transform: "scale(1.04)" },
          "100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0)", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s var(--transition-smooth) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "stamp-in": "stamp-in 0.9s var(--transition-bounce) both",
        "ripple": "ripple 1.4s ease-out forwards",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "breathe": "breathe 6.5s ease-in-out infinite",
        "soft-confirm": "soft-confirm 900ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
