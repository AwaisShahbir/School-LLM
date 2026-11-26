/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7048E8", // Violet primary
          hover: "#5E37D3",
          light: "#EEE9FD",  // Pale violet for chips, pills
        },
        brand: {
          lavender: "#C9B6FA",
          page: "#F4F3F8",
          dark: "#1F1B2E",
          muted: "#6B6880",
          card: "#FFFFFF",
        },
        status: {
          present: "#7048E8",
          absent: "#F27D8D",
          late: "#F6C177",
          leave: "#64748B",
          paid: "#2FA36B",
          pending: "#F27D8D",
        }
      },
      fontFamily: {
        sans: ['Urbanist', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '22px',
        'pill': '9999px',
        'input': '14px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(112, 72, 232, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -4px rgba(31, 27, 46, 0.05)',
      }
    },
  },
  plugins: [],
}
