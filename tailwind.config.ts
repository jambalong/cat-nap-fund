import type { Config } from 'tailwindcss'

const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: v('cream'),
        card: v('card'),
        peach: v('peach'),
        sage: v('sage'),
        rose: v('rose'),
        ink: v('ink'),
        muted: v('muted'),
      },
      fontFamily: {
        display: ['Fredoka', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: { soft: '0 6px 24px -8px rgb(var(--ink) / 0.25)' },
    },
  },
} satisfies Config
