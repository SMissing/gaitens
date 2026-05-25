import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GlobalDock } from '@/components/layout/GlobalDock'
import { DockWrapper } from '@/components/layout/DockWrapper'
import { GlobalAchievementNotification } from '@/components/achievements/GlobalAchievementNotification'
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
        {/* #region agent log (SW registration) */}
        <Script
          id="register-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Version the SW script URL in dev so Chrome fetches the new script.
                // This avoids being stuck with an older cached SW that throws at runtime.
                const SW_SCRIPT_URL = '/sw.js?swver=20260318_1'
                navigator.serviceWorker.register(SW_SCRIPT_URL)
                  .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                    fetch('http://127.0.0.1:7877/ingest/9d5d80a7-cef2-45ef-b10c-77db6895456c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3ce7f9'},body:JSON.stringify({sessionId:'3ce7f9',location:'app/layout.tsx:register-service-worker',message:'ServiceWorker registration successful',hypothesisId:'H4',runId:'post-fix',data:{scope:registration && registration.scope},timestamp:Date.now()})}).catch(()=>{});
                    registration.update && registration.update()
                    fetch('http://127.0.0.1:7877/ingest/9d5d80a7-cef2-45ef-b10c-77db6895456c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3ce7f9'},body:JSON.stringify({sessionId:'3ce7f9',location:'app/layout.tsx:register-service-worker',message:'ServiceWorker registration triggered update',hypothesisId:'H4',runId:'post-fix',data:{swScriptUrl:SW_SCRIPT_URL},timestamp:Date.now()})}).catch(()=>{});
                  })
                  .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                    fetch('http://127.0.0.1:7877/ingest/9d5d80a7-cef2-45ef-b10c-77db6895456c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3ce7f9'},body:JSON.stringify({sessionId:'3ce7f9',location:'app/layout.tsx:register-service-worker',message:'ServiceWorker registration failed',hypothesisId:'H4',runId:'post-fix',data:{error:String(err && err.message || err)},timestamp:Date.now()})}).catch(()=>{});
                  });

                // #region agent log (prove SW control)
                try {
                  fetch('http://127.0.0.1:7877/ingest/9d5d80a7-cef2-45ef-b10c-77db6895456c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3ce7f9'},body:JSON.stringify({sessionId:'3ce7f9',location:'app/layout.tsx:sw-controller',message:'Service worker controller on register',hypothesisId:'H4',runId:'post-fix',data:{controllerUrl:(navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.url) || null},timestamp:Date.now()})}).catch(()=>{});
                } catch(e) {}
                // #endregion agent log
              }
            `,
          }}
        />
        {/* #endregion agent log */}
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
        <GlobalAchievementNotification />
        <Analytics />
      </body>
    </html>
  )
}
