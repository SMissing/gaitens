import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import { GlobalDock } from '@/components/layout/GlobalDock'
import { DockWrapper } from '@/components/layout/DockWrapper'
import { SessionResumeRefresh } from '@/components/auth/SessionResumeRefresh'
import { CalmPortalBackground } from '@/components/layout/CalmPortalBackground'

export const metadata: Metadata = {
  title: 'Gaitens Leisure Group - Staff Portal',
  description: 'Internal staff portal for Gaitens Leisure Group',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gaitens Portal',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Version the SW script URL in dev so Chrome fetches the new script.
                // This avoids being stuck with an older cached SW that throws at runtime.
                const SW_SCRIPT_URL = '/sw.js?swver=20260602_1'
                navigator.serviceWorker.register(SW_SCRIPT_URL)
                  .then(function(registration) {
                    registration.update && registration.update()
                  })
                  .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
              }
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
          <CalmPortalBackground />
          <SessionResumeRefresh />
          {children}
        </div>
        <DockWrapper>
          <GlobalDock />
        </DockWrapper>
        {/* Global Achievement Notifications - Works on all pages */}
        {/* Achievement card-pack animation disabled — to be rebuilt */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
