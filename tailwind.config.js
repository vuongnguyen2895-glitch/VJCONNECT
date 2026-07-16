/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FAF6F9",
          100: "#F3E8F1",
          200: "#E6CBE1",
          300: "#D2A3C9",
          400: "#B87BAC",
          500: "#9C5B90",
          600: "#814775",
          700: "#693860",
          800: "#522C4C",
          900: "#3B2038",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
