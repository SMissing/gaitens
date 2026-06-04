'use client'

import Link from 'next/link'
import { ShieldOff, FileText, ArrowRight } from 'lucide-react'

export function GrievanceDecision() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">What do you need?</h1>
        <p className="text-sm text-muted-foreground">
          Choose the right channel for your situation. Both are handled with full confidentiality.
        </p>
      </div>

      {/* Anonymous Report */}
      <Link
        href="/anonymous-report"
        className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-[#1a1a1a] px-5 py-4 transition-colors hover:border-border/70 hover:bg-[#222] active:scale-[0.99] touch-manipulation"
      >
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-spirits-cyan/10">
          <ShieldOff className="h-5 w-5 text-spirits-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Report anonymously</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Quick, informal, and no follow-up required. Your name is never attached. Use this to flag something without starting a formal process.
          </p>
        </div>
        <ArrowRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1 self-start" />
      </Link>

      {/* Formal Grievance */}
      <Link
        href="/grievance?confirmed=true"
        className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-[#1a1a1a] px-5 py-4 transition-colors hover:border-border/70 hover:bg-[#222] active:scale-[0.99] touch-manipulation"
      >
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-garrison-orange/10">
          <FileText className="h-5 w-5 text-garrison-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">File a formal grievance</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            A recorded, named submission handled by management. Use this when you need a formal response or the situation is serious enough to require a follow-up process.
          </p>
        </div>
        <ArrowRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1 self-start" />
      </Link>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Both options are kept strictly confidential and handled professionally.
      </p>
    </div>
  )
}
