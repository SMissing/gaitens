'use client'

import { useRouter } from 'next/navigation'

interface Section {
  id: string
  title: string
}

interface HandbookContentsListProps {
  sections: Section[]
  bookId: string
}

export function HandbookContentsList({ sections, bookId }: HandbookContentsListProps) {
  const router = useRouter()

  const handleClick = (sectionId: string) => {
    const params = new URLSearchParams()
    params.set('book', bookId)
    params.set('section', sectionId)
    router.push(`/handbook?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Contents</h2>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary w-6">
                {index + 1}
              </span>
              <span className="font-medium">{section.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
