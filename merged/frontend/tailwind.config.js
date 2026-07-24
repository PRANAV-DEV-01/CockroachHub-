/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cjp: {
          maroon: "#800000",
          "maroon-light": "#a52a2a",
          tricolor: { orange: "#FF9933", white: "#FFFFFF", green: "#138808" },
        },
        ph: {
          black: "#0d0d0d",
          dark: "#171717",
          "dark-2": "#1a1a1a",
          card: "#1f1f1f",
          "card-hover": "#2a2a2a",
          orange: "#FF9900",
          "orange-hover": "#FFB033",
          "orange-muted": "rgba(255,153,0,0.1)",
          text: "#ffffff",
          "text-secondary": "#999999",
          "text-muted": "#666666",
          "text-dark": "#333333",
          border: "#333333",
          "border-light": "#e6e6e6",
          "green": "#2ecc71",
          "red": "#e74c3c",
          "yellow": "#f39c12",
          light: "#f5f5f5",
          white: "#ffffff",
        },
        // SafeCircle section tokens. Only meaningful inside `.safecircle-scope`
        // (see src/safecircle/safecircle.css) — harmless everywhere else since
        // nothing in CockroachHub's own pages uses these class names.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "card-border": "hsl(var(--card-border))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ['Geist', 'Arial', 'Helvetica', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Used only within the SafeCircle section (src/safecircle)
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
