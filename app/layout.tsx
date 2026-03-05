import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gaitens Leisure Group - Staff Portal',
  description: 'Internal staff portal for Gaitens Leisure Group',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="relative">
        <Script
          id="force-dark-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const html = document.documentElement;
                  html.classList.add('dark');
                  html.style.colorScheme = 'dark';
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Background logo watermark */}
        <div 
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{
            opacity: 0.08,
          }}
        >
          <img 
            src="/logos/gaitens-logo-white.png" 
            alt="Gaitens Leisure" 
            className="w-[60vw] max-w-[800px] h-auto"
          />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
