import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4b5fd',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        navy: {
          800: '#1a2148',
          900: '#0f1535',
          950: '#0a0e27',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
