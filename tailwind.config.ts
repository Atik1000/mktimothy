import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
        xms: "520px",
        sss: "800px",
        xsm: "570px",
        xmd: "900px",
        slg: "950px",
        xlg: "1100px",
        xxl: "1200px",
      },
      colors: {
        bgdark: "#2C2C2C",
        bglight: "#1E1E1E",
        textdark: "#121212",
        textlight: "#121212",
        lightgray: "#4A4A4A",
        greencolor: "#00805A",
        lighttext: "#C6CAD6",
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(to right, #1C70A0, #00A2FF)",
      },
      fontFamily: {
        hind: ["var(--font-hind)"],
        manrope: ["var(--font-manrope)"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        nunito: ["var(--font-nunito)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        sofia: ["Sofia", "sans-serif"],
        sans: ["Sofia", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

