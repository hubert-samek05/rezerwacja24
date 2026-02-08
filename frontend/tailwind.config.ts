import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'max-md': {'max': '767px'},
    },
    extend: {
      colors: {
        // Dark Metallic Green Gradient Theme
        primary: {
          dark: '#0B2E23',
          DEFAULT: '#0F6048',
          light: '#13785A',
        },
        accent: {
          neon: '#10B981', // Ciemniejszy, bardziej czytelny zielony (emerald-500)
          DEFAULT: '#10B981',
        },
        neutral: {
          gray: '#D9D9D9',
          DEFAULT: '#D9D9D9',
        },
        carbon: {
          black: '#0A0A0A',
          DEFAULT: '#0A0A0A',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0B2E23 0%, #0F6048 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0F6048 0%, #41FFBC 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(65, 255, 188, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(65, 255, 188, 0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
