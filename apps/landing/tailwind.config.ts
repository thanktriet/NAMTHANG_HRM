import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0057FF",
          50: "#E6EEFF",
          100: "#CCE0FF",
          200: "#99BFFF",
          300: "#66A0FF",
          400: "#3380FF",
          500: "#0057FF",
          600: "#0046CC",
          700: "#003499",
          800: "#002366",
          900: "#001133",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
