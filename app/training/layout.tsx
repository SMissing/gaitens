import type { ReactNode } from 'react'

export default function TrainingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/*
        Set the body/html background at SSR time so no other backdrop
        bleeds through edges (scrollbar gap, safe-area, etc.) before
        client JS runs. This must live here in the layout — a body class
        added by a client component only applies after hydration.
      */}
      <style>{`html, body { background-color: #0c0c1e !important; }`}</style>
      {children}
    </>
  )
}
