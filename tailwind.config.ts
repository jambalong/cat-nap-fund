import type { Config } from 'tailwindcss'

const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: v('base'),
        mantle: v('mantle'),
        surface: v('surface'),
        ink: v('ink'),
        muted: v('muted'),
        accent: v('accent'),
        onaccent: v('onaccent'),
        pink: v('pink'),
        green: v('green'),
        red: v('red'),
      },
      fontFamily: {
        display: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: { soft: '0 1px 2px rgb(var(--ink) / 0.08)' },
    },
  },
} satisfies Config
