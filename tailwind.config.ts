import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system colours: RGB channels from globals.css so opacity modifiers work (bg-card/50)
        background: 'rgb(var(--rgb-background) / <alpha-value>)',
        foreground: 'rgb(var(--rgb-foreground) / <alpha-value>)',
        card: 'rgb(var(--rgb-card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--rgb-card-foreground) / <alpha-value>)',
        popover: 'rgb(var(--rgb-popover) / <alpha-value>)',
        'popover-foreground': 'rgb(var(--rgb-popover-foreground) / <alpha-value>)',
        primary: 'rgb(var(--rgb-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--rgb-primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--rgb-secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--rgb-secondary-foreground) / <alpha-value>)',
        muted: 'rgb(var(--rgb-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--rgb-muted-foreground) / <alpha-value>)',
        accent: 'rgb(var(--rgb-accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--rgb-accent-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--rgb-destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--rgb-destructive-foreground) / <alpha-value>)',
        border: 'rgb(var(--rgb-border) / <alpha-value>)',
        input: 'rgb(var(--rgb-input) / <alpha-value>)',
        ring: 'rgb(var(--rgb-ring) / <alpha-value>)',

        // Dark theme aliases for easier use
        dark: {
          bg: 'rgb(var(--rgb-background) / <alpha-value>)',
          surface: 'rgb(var(--rgb-card) / <alpha-value>)',
          surfaceHover: 'rgb(var(--rgb-accent) / <alpha-value>)',
          border: 'rgb(var(--rgb-border) / <alpha-value>)',
          text: 'rgb(var(--rgb-foreground) / <alpha-value>)',
          textMuted: 'rgb(var(--rgb-muted-foreground) / <alpha-value>)',
        },

        // Gaitens + venue palette v1 (Figma: Foundations)
        gaitens: {
          yellow: 'rgb(var(--rgb-gaitens-yellow) / <alpha-value>)',
        },
        spirits: {
          cyan: 'rgb(var(--rgb-spirits-cyan) / <alpha-value>)',
          cyanDark: 'rgb(var(--rgb-spirits-cyan-dark) / <alpha-value>)',
          magenta: 'rgb(var(--rgb-spirits-magenta) / <alpha-value>)',
          magentaDark: 'rgb(var(--rgb-spirits-magenta-dark) / <alpha-value>)',
          yellow: 'rgb(var(--rgb-spirits-yellow) / <alpha-value>)',
          yellowDark: 'rgb(var(--rgb-spirits-yellow-dark) / <alpha-value>)',
        },
        garrison: {
          pink: 'rgb(var(--rgb-garrison-pink) / <alpha-value>)',
          violet: 'rgb(var(--rgb-garrison-violet) / <alpha-value>)',
          cyan: 'rgb(var(--rgb-garrison-cyan) / <alpha-value>)',
          mint: 'rgb(var(--rgb-garrison-mint) / <alpha-value>)',
          teal: 'rgb(var(--rgb-garrison-teal) / <alpha-value>)',
          coral: 'rgb(var(--rgb-garrison-coral) / <alpha-value>)',
          black: 'rgb(var(--rgb-garrison-black) / <alpha-value>)',
          white: 'rgb(var(--rgb-garrison-white) / <alpha-value>)',
        },
        bassment: {
          violet: 'rgb(var(--rgb-bassment-violet) / <alpha-value>)',
          orchid: 'rgb(var(--rgb-bassment-orchid) / <alpha-value>)',
          aurora: 'rgb(var(--rgb-bassment-aurora) / <alpha-value>)',
          auroraDark: 'rgb(var(--rgb-bassment-aurora-dark) / <alpha-value>)',
          night: 'rgb(var(--rgb-bassment-night) / <alpha-value>)',
        },
      },
      backgroundImage: {
        // Card glows (Figma: Card/Glow *). Pair with bg-card, e.g. "bg-card bg-glow-spirits"
        'glow-gaitens': 'var(--glow-gaitens)',
        'glow-spirits': 'var(--glow-spirits)',
        'glow-garrison': 'var(--glow-garrison)',
        'glow-bassment': 'var(--glow-bassment)',
        'glow-warning': 'var(--glow-warning)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
    },
  },
  plugins: [],
}
export default config
