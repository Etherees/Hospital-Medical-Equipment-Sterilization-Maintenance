/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'steril-black': '#050706',
        'steril-charcoal': '#0B100E',
        'steril-card': '#111815',
        'steril-surface': '#151D19',
        'steril-border': '#252C28',
        'steril-green': '#20F59A',
        'steril-mint': '#83F7C2',
        'steril-text': '#F5F7F6',
        'steril-muted': '#929A96',
        'steril-amber': '#F59E0B',
        'steril-red': '#EF4444',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(32, 245, 154, 0.25)',
        'glow-green-sm': '0 0 10px rgba(32, 245, 154, 0.18)',
        'glow-green-lg': '0 0 35px rgba(32, 245, 154, 0.35)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.35)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(32, 245, 154, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
