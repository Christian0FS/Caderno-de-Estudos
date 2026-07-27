/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EDEFE9",
        "paper-alt": "#F7F8F4",
        card: "#FFFFFF",
        ink: "#1F2A24",
        "ink-soft": "#4B5750",
        moss: {
          DEFAULT: "#3D5A45",
          dark: "#2C4433",
          light: "#5C7C63",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E4C567",
        },
        brick: {
          DEFAULT: "#B5533C",
          light: "#D98868",
        },
        line: "#D8DBCF",
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
