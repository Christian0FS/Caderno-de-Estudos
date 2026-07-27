/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        "paper-alt": "var(--color-paper-alt)",
        card: "var(--color-card)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        moss: {
          DEFAULT: "var(--color-moss)",
          dark: "var(--color-moss-dark)",
          light: "var(--color-moss-light)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          light: "var(--color-gold-light)",
        },
        brick: {
          DEFAULT: "var(--color-brick)",
          light: "var(--color-brick-light)",
        },
        line: "var(--color-line)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 42, 36, 0.06), 0 1px 0 rgba(31, 42, 36, 0.04)",
        lift: "0 8px 24px rgba(31, 42, 36, 0.10)",
      },
      borderRadius: {
        sheet: "10px",
      },
    },
  },
  plugins: [],
};
