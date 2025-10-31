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
        // Foodhub Brand Colors
        'foodhub-red': '#D82927',
        'foodhub-red-dark': '#B02120',
        'foodhub-red-light': '#E05C5B',
        'foodhub-orange': '#EF901C',
        'foodhub-yellow': '#FEBE1B',
        'foodhub-teal': '#009A90',
        'foodhub-purple': '#745CA8',
        'foodhub-darkpurple': '#2B0E3A',
        'foodhub-black': '#111111',
        'foodhub-link': '#198EBC',
        // Keep old structure for backward compatibility
        foodhub: {
          primary: '#D82927',     // Primary Red
          orange: '#EF901C',      // Secondary Orange
          yellow: '#FEBE1B',      // Secondary Yellow
          teal: '#009A90',        // Secondary Teal
          purple: '#745CA8',      // Secondary Purple
          darkpurple: '#2B0E3A',  // Secondary Dark Purple
          black: '#111111',       // Common Black
          link: '#198EBC',        // Hyperlink Blue
        },
      },
      fontFamily: {
        // Foodhub uses Lato
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;


