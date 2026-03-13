'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Section {
  id: string
  title: string
}

interface HandbookContentsProps {
  sections: Section[]
  bookId: string
}

export function HandbookContents({ sections, bookId }: HandbookContentsProps) {
  const router = useRouter()

  const handleSectionClick = (sectionId: string) => {
    router.push(`/handbook?book=${bookId}&section=${sectionId}`)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-spirits-cyan" />
        <h2 className="text-2xl font-semibold text-foreground">Contents</h2>
      </div>
      
      <div className="space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
              "bg-[#1e1e1e] border-border/30 hover:border-spirits-cyan/50 hover:bg-[#262626]",
              "text-left group"
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-spirits-cyan w-8 text-center">
                {index + 1}
              </span>
              <span className="font-medium text-foreground group-hover:text-spirits-cyan transition-colors">
                {section.title}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-spirits-cyan transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
