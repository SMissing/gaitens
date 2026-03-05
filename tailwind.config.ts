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
        // Design system colors (from CSS variables)
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        'card-foreground': 'var(--color-card-foreground)',
        popover: 'var(--color-popover)',
        'popover-foreground': 'var(--color-popover-foreground)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        secondary: 'var(--color-secondary)',
        'secondary-foreground': 'var(--color-secondary-foreground)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        accent: 'var(--color-accent)',
        'accent-foreground': 'var(--color-accent-foreground)',
        destructive: 'var(--color-destructive)',
        'destructive-foreground': 'var(--color-destructive-foreground)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        
        // Dark theme aliases for easier use
        dark: {
          bg: 'var(--color-background)',
          surface: 'var(--color-card)',
          surfaceHover: 'var(--color-accent)',
          border: 'var(--color-border)',
          text: 'var(--color-foreground)',
          textMuted: 'var(--color-muted-foreground)',
        },
        
        // Venue-specific colors
        spirits: {
          cyan: 'var(--color-spirits-cyan)',
          cyanDark: 'var(--color-spirits-cyan-dark)',
          magenta: 'var(--color-spirits-magenta)',
          magentaDark: 'var(--color-spirits-magenta-dark)',
          yellow: 'var(--color-spirits-yellow)',
          yellowDark: 'var(--color-spirits-yellow-dark)',
        },
        garrison: {
          orange: 'var(--color-garrison-orange)',
          orangeBright: 'var(--color-garrison-orange-bright)',
          orangeDark: 'var(--color-garrison-orange-dark)',
          black: 'var(--color-garrison-black)',
          white: 'var(--color-garrison-white)',
        },
        bassment: {
          pink: 'var(--color-bassment-pink)',
          pinkBright: 'var(--color-bassment-pink-bright)',
          pinkDark: 'var(--color-bassment-pink-dark)',
          green: 'var(--color-bassment-green)',
          greenBright: 'var(--color-bassment-green-bright)',
          greenDark: 'var(--color-bassment-green-dark)',
        },
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
