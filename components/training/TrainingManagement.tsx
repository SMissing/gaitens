'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { staffListFromApiResponse } from '@/lib/staff-permissions'
import {
  TRAINING_DOCK_ADD,
  TRAINING_DOCK_CLOSE_FORM,
  TRAINING_DOCK_SUBMIT_FORM,
  TRAINING_DOCK_REFRESH,
  TRAINING_DOCK_STATE,
} from '@/lib/training-dock-bridge'

const VENUE_ALL_KEY = '__all_venues__'
const CATEGORY_GENERAL_KEY = '__general__'

function venueDisplayKey(site: string | null | undefined): string {
  const s = site?.trim()
  return s ? s : VENUE_ALL_KEY
}

function venueHeading(siteKey: string): string {
  return siteKey === VENUE_ALL_KEY ? 'All venues' : siteKey
}

function categoryHeading(categoryKey: string): string {
  return categoryKey === CATEGORY_GENERAL_KEY
    ? 'General'
    : categoryKey
}

/** Gaitens Leisure Group mark — used for “All venues” and unknown site names */
const GAITENS_GROUP_LOGO = '/logos/gaitens-logo-white.png'

/**
 * Venue logo for dropdown header (paths match `BusinessSelection` / ideas).
 * Custom or unmatched site names fall back to the group logo.
 */
function logoSrcForVenueKey(venueKey: string): string {
  if (venueKey === VENUE_ALL_KEY) return GAITENS_GROUP_LOGO
  const n = venueKey.toLowerCase()
  if (n.includes('garrison')) return '/logos/garrison-logo-white.png'
  if (n.includes('spirit')) return '/logos/spirits-logo.png'
  if (n.includes('bassment')) return '/logos/bassment-logo.png'
  return GAITENS_GROUP_LOGO
}

/** Venue dropdown shell (yellow — learning / module maker) */
const VENUE_DETAILS_SHELL =
  'border-spirits-yellow/40 bg-spirits-yellow/[0.1]'
const VENUE_DETAILS_INNER =
  'border-t border-white/10 bg-[#161616] px-2 pb-3 pt-3 sm:px-3'

function FormSection({
  title,
  hint,
  children,
  id,
}: {
  title: string
  hint?: string
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="border-t border-white/[0.08] pt-8 first:border-t-0 first:pt-0 scroll-mt-20">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-spirits-yellow/90">
        {title}
      </h2>
      {hint ? (
        <p className="text-sm text-muted-foreground mt-1.5 mb-5 leading-relaxed max-w-prose">
          {hint}
        </p>
      ) : (
        <div className="mb-5" />
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}

// ── Content section builder ──────────────────────────────────────────────────

interface ContentSection {
  title: string
  body: string
}

const defaultSection = (): ContentSection => ({ title: '', body: '' })

/** Convert section array → HTML stored in the database content field */
function sectionsToHtml(sections: ContentSection[]): string {
  return sections
    .map(s => {
      const parts: string[] = []
      if (s.title.trim()) parts.push(`<h2>${s.title.trim()}</h2>`)
      if (s.body.trim()) {
        const paragraphs = s.body.trim()
          .split(/\n\n+/)
          .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
          .filter(p => p !== '<p></p>')
        if (paragraphs.length) parts.push(paragraphs.join('\n'))
      }
      return parts.join('\n')
    })
    .filter(s => s.trim())
    .join('\n\n')
}

/** Parse stored HTML back into editable sections */
/** Convert HTML to plain text for textarea editing */
function stripToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

/**
 * Parse stored HTML back into editable sections.
 * Uses the same <h2>/<h3> split boundary as the lesson viewer (paginateHTML),
 * so what staff see as pages maps 1-to-1 to sections the manager can edit.
 */
function htmlToSections(html: string | null | undefined): ContentSection[] {
  if (!html?.trim()) return [defaultSection()]

  // Same heading boundary as paginateHTML in CoursePage
  const hasHeadings = /<h[23][\s>]/i.test(html)

  if (hasHeadings) {
    const parts = html.split(/(?=<h[23][\s>])/i).filter(p => p.trim())
    const sections = parts.map(part => {
      const headingMatch = part.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i)
      const title = headingMatch ? headingMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      const bodyHtml = part.replace(/<h[23][^>]*>[\s\S]*?<\/h[23]>/i, '')
      const body = stripToText(bodyHtml)
      return { title, body }
    }).filter(s => s.title || s.body)

    if (sections.length > 0) return sections
  }

  // No headings — single untitled section
  const body = stripToText(html)
  return [{ title: '', body: body || html.trim() }]
}

// ────────────────────────────────────────────────────────────────────────────

const emptyForm = () => ({
  title: '',
  description: '',
  videoUrl: '',
  content: '',
  site: '',
  requiredScope: 'none' as 'none' | 'site' | 'all',
  category: '',
  moduleType: 'video' as 'video' | 'text' | 'guide',
  duration: '',
  quizQuestions: [] as Array<{
    question: string
    options: string[]
    correctAnswer: number
  }>,
})

export function TrainingManagement() {
  const formRef = useRef<HTMLFormElement>(null)
  const [courses, setCourses] = useState<
    Array<TrainingCourse & { users?: { name: string } }>
  >([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sites, setSites] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  // DC-14: inline delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  // DC-16: active form step (0-3)
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState(emptyForm)
  // Structured content sections (serialised to HTML on save)
  const [sections, setSections] = useState<ContentSection[]>([defaultSection()])
  // Only re-serialise sections if the manager actually edited them.
  // If sections were untouched (e.g. only quiz changed), preserve the original HTML.
  const [sectionsModified, setSectionsModified] = useState(false)

  /** Venue → category → courses (sorted). */
  const modulesByVenueAndCategory = useMemo(() => {
    const outer = new Map<string, Map<string, TrainingCourse[]>>()

    for (const c of courses) {
      const vKey = venueDisplayKey(c.site)
      const cKey =
        c.category?.trim() ? c.category.trim() : CATEGORY_GENERAL_KEY
      if (!outer.has(vKey)) outer.set(vKey, new Map())
      const inner = outer.get(vKey)!
      if (!inner.has(cKey)) inner.set(cKey, [])
      inner.get(cKey)!.push(c)
    }

    for (const inner of outer.values()) {
      for (const list of inner.values()) {
        list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      }
    }

    return outer
  }, [courses])

  const orderedVenueKeys = useMemo(() => {
    const keys = Array.from(modulesByVenueAndCategory.keys())
    keys.sort((a, b) => {
      if (a === VENUE_ALL_KEY) return -1
      if (b === VENUE_ALL_KEY) return 1
      return a.localeCompare(b, undefined, { sensitivity: 'base' })
    })
    return keys
  }, [modulesByVenueAndCategory])

  const fetchSites = useCallback(async () => {
    try {
      const response = await fetch('/api/staff?active=true')
      if (response.ok) {
        const data = await response.json()
        const staff = staffListFromApiResponse(data)
        const uniqueSites = Array.from(
          new Set(staff.map((s: { site?: string | null }) => s.site).filter(Boolean))
        )
        setSites(uniqueSites as string[])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/training?all=true')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCourses()
    void fetchSites()
  }, [fetchCourses, fetchSites])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(TRAINING_DOCK_STATE, {
        detail: {
          formOpen: showForm,
          listLoading: loading,
          saving,
          editing: editingCourse != null,
        },
      })
    )
  }, [showForm, loading, saving, editingCourse])

  // DC-16: form step tracker via IntersectionObserver
  const SECTION_IDS = ['fm-basics', 'fm-audience', 'fm-content', 'fm-quiz'] as const
  useEffect(() => {
    if (!showForm) return
    const observers: IntersectionObserver[] = []
    SECTION_IDS.forEach((id, idx) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(idx) },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm])

  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingCourse(null)
    setSaveError(null)
    setActiveStep(0)
    setFormData(emptyForm())
    setSections([defaultSection()])
    setSectionsModified(false)
  }, [])

  useEffect(() => {
    const onAdd = () => {
      setSaveError(null)
      setEditingCourse(null)
      setFormData(emptyForm())
      setSections([defaultSection()])
      setSectionsModified(false)
      setActiveStep(0)
      setShowForm(true)
    }
    const onClose = () => closeForm()
    const onRefresh = () => {
      void fetchCourses()
      void fetchSites()
    }

    const onSubmitFromDock = () => {
      formRef.current?.requestSubmit()
    }

    window.addEventListener(TRAINING_DOCK_ADD, onAdd)
    window.addEventListener(TRAINING_DOCK_CLOSE_FORM, onClose)
    window.addEventListener(TRAINING_DOCK_SUBMIT_FORM, onSubmitFromDock)
    window.addEventListener(TRAINING_DOCK_REFRESH, onRefresh)

    return () => {
      window.removeEventListener(TRAINING_DOCK_ADD, onAdd)
      window.removeEventListener(TRAINING_DOCK_CLOSE_FORM, onClose)
      window.removeEventListener(TRAINING_DOCK_SUBMIT_FORM, onSubmitFromDock)
      window.removeEventListener(TRAINING_DOCK_REFRESH, onRefresh)
    }
  }, [closeForm, fetchCourses, fetchSites])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    try {
      const url = editingCourse
        ? `/api/training/${editingCourse}`
        : '/api/training'
      const method = editingCourse ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        // Only re-serialise if sections were actually edited — otherwise keep the
        // original HTML so quiz-only edits never disturb the content structure.
        content: sectionsModified ? sectionsToHtml(sections) : (formData.content || ''),
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
        site: formData.site || null,
        category: formData.category || null,
        requiredScope: formData.requiredScope,
        quizQuestions:
          formData.quizQuestions.length > 0 ? formData.quizQuestions : [],
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save training module')
      }

      closeForm()
      await fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      setSaveError('Could not save this module. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (course: TrainingCourse) => {
    setSaveError(null)
    setFormData({
      title: course.title,
      description: course.description || '',
      videoUrl: course.videoUrl || '',
      content: course.content || '',
      site: course.site || '',
      requiredScope: course.requiredScope ?? 'none',
      category: course.category || '',
      moduleType: course.moduleType,
      duration: course.duration?.toString() || '',
      quizQuestions: course.quizQuestions || [],
    })
    setSections(htmlToSections(course.content))
    setSectionsModified(false)
    setActiveStep(0)
    setEditingCourse(course.id)
    setShowForm(true)
  }

  // DC-14: two-step inline delete — no window.confirm()
  const handleDeleteClick = (courseId: string) => {
    setConfirmDeleteId(courseId)
  }

  const handleDeleteConfirm = async (courseId: string) => {
    setConfirmDeleteId(null)
    try {
      const response = await fetch(`/api/training/${courseId}`, { method: 'DELETE' })
      if (response.ok) void fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quizQuestions: [
        ...formData.quizQuestions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      ],
    })
  }

  const updateQuizQuestion = (index: number, field: string, value: unknown) => {
    const updated = [...formData.quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, quizQuestions: updated })
  }

  const removeQuizQuestion = (index: number) => {
    setFormData({
      ...formData,
      quizQuestions: formData.quizQuestions.filter((_, i) => i !== index),
    })
  }

  if (loading && courses.length === 0 && !showForm) {
    return (
      <Card className="border-border/40 bg-[#1e1e1e]/80">
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin shrink-0" />
          <span>Loading modules…</span>
        </CardContent>
      </Card>
    )
  }

  if (showForm) {
    return (
      <div className="w-full pb-8">
        {saveError && (
          <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-w-2xl"
        >
          <header className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {editingCourse ? "Edit training module" : "New training module"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed max-w-prose">
              {editingCourse
                ? "Change what staff see, where this module applies, and any quiz. Use the dock below to cancel or save."
                : "Give it a name, say who it’s for, then add content. Cancel or publish from the dock below."}
            </p>

            {/* DC-16: sticky 4-step progress indicator */}
            <div className="sticky top-0 z-10 -mx-1 mt-6 rounded-xl border border-border/20 bg-background/80 backdrop-blur-sm px-3 py-2.5">
              <div className="flex items-center gap-1">
                {(["Basics", "Audience", "Content", "Quiz"] as const).map((label, idx) => (
                  <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors",
                        idx < activeStep && "bg-green-500 text-white",
                        idx === activeStep && "bg-spirits-yellow text-black",
                        idx > activeStep && "bg-muted text-muted-foreground",
                      )}>
                        {idx < activeStep ? "✓" : idx + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-medium truncate transition-colors",
                        idx === activeStep ? "text-spirits-yellow" : "text-muted-foreground",
                      )}>
                        {label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={cn(
                        "h-px flex-1 mx-1 transition-colors",
                        idx < activeStep ? "bg-green-500" : "bg-border/30",
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="space-y-10">
            <FormSection
              id="fm-basics"
              title="Basics"
              hint="What staff see in the list, and whether this is mainly video, reading, or a guide."
            >
              <div className="space-y-2">
                <Label htmlFor="title">Module title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Opening checklist"
                  className="bg-background/80 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="One line summary (optional)"
                  className="bg-background/80 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moduleType">Format</Label>
                <Select
                  id="moduleType"
                  options={[
                    { value: 'video', label: 'Video — link + notes below' },
                    { value: 'text', label: 'Text — reading in the app' },
                    { value: 'guide', label: 'Guide — structured content' },
                  ]}
                  value={formData.moduleType}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      moduleType: value as 'video' | 'text' | 'guide',
                    })
                  }
                  placeholder="Choose format"
                />
              </div>
            </FormSection>

            <FormSection
              id="fm-audience"
              title="Who it applies to"
              hint="Pick a single venue or leave All sites. Mandatory controls whether completion is required."
            >
              <div className="space-y-2">
                <Label htmlFor="site">Venue</Label>
                <Select
                  id="site"
                  options={[
                    { value: '', label: 'All sites (everyone)' },
                    ...sites.map((site) => ({ value: site, label: site })),
                  ]}
                  value={formData.site}
                  onChange={(value) => {
                    setFormData({ ...formData, site: value, category: '' })
                  }}
                  placeholder="All sites"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredScope">Mandatory completion</Label>
                <Select
                  id="requiredScope"
                  options={[
                    { value: 'none', label: 'Optional — not tracked as required' },
                    {
                      value: 'site',
                      label: 'Required — only for staff on the venue above',
                    },
                    {
                      value: 'all',
                      label: 'Required — everyone (even if venue is “all sites”)',
                    },
                  ]}
                  value={formData.requiredScope}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      requiredScope: value as 'none' | 'site' | 'all',
                    })
                  }
                  placeholder="Choose"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Section label (optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Groups modules in Module Maker, e.g. Bar, Kitchen"
                  className="bg-background/80 border-border/50"
                />
              </div>
            </FormSection>

            <FormSection
              id="fm-content"
              title="Content"
              hint={
                formData.moduleType === 'video'
                  ? 'Paste a YouTube or direct video link below, then add as many content sections as you like beneath it.'
                  : 'Build the training content section by section. Each section can have an optional heading and its own text — staff see them as separate pages.'
              }
            >
              {/* Video URL */}
              {formData.moduleType === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video link</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/… or direct .mp4 link"
                    className="bg-background/80 border-border/50"
                  />
                </div>
              )}

              {/* Section builder */}
              <div className="space-y-4">
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-spirits-yellow">
                        Section {idx + 1}
                      </span>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => { setSections(s => s.filter((_, i) => i !== idx)); setSectionsModified(true) }}
                          className="rounded-md p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Remove section"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      )}
                    </div>

                    {/* Section title */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Heading <span className="opacity-50">(optional)</span>
                      </Label>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const updated = [...sections]
                          updated[idx] = { ...updated[idx], title: e.target.value }
                          setSections(updated)
                          setSectionsModified(true)
                        }}
                        placeholder="e.g. Opening Procedures, Health & Safety…"
                        className="bg-background/80 border-border/50"
                      />
                    </div>

                    {/* Section body */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Content</Label>
                      <textarea
                        value={section.body}
                        onChange={(e) => {
                          const updated = [...sections]
                          updated[idx] = { ...updated[idx], body: e.target.value }
                          setSections(updated)
                          setSectionsModified(true)
                        }}
                        rows={5}
                        className="w-full rounded-xl border border-border/50 bg-background/80 px-3 py-3 text-sm leading-relaxed resize-y"
                        placeholder="Write the content for this section. Press Enter twice to start a new paragraph."
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-spirits-yellow/40 text-spirits-yellow hover:bg-spirits-yellow/10"
                  onClick={() => { setSections(s => [...s, defaultSection()]); setSectionsModified(true) }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add section
                </Button>
              </div>

              {/* Duration */}
              <div className="space-y-2 max-w-xs pt-2">
                <Label htmlFor="duration">Estimated time (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={0}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g. 5"
                  className="bg-background/80 border-border/50"
                />
              </div>
            </FormSection>

            <FormSection
              id="fm-quiz"
              title="Knowledge check (optional)"
              hint="Multiple choice. Use the dot to mark the correct answer. Skip this if you don’t need a quiz."
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {formData.quizQuestions.length === 0
                    ? 'No questions yet.'
                    : `${formData.quizQuestions.length} question${formData.quizQuestions.length === 1 ? '' : 's'}`}
                </p>
                <Button
                  type="button"
                  onClick={addQuizQuestion}
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add question
                </Button>
              </div>
              <div className="space-y-4 pt-2">
                {formData.quizQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border-l-2 border-spirits-yellow/50 bg-white/[0.03] pl-4 pr-3 py-4 space-y-3"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Question {idx + 1}
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeQuizQuestion(idx)}
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Type the question"
                      value={q.question}
                      onChange={(e) =>
                        updateQuizQuestion(idx, 'question', e.target.value)
                      }
                      className="bg-background/80 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Answers — select the correct one
                    </p>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctAnswer === optIdx}
                          onChange={() =>
                            updateQuizQuestion(idx, 'correctAnswer', optIdx)
                          }
                          className="h-4 w-4 shrink-0 accent-spirits-yellow"
                        />
                        <Input
                          placeholder={`Answer ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options]
                            newOptions[optIdx] = e.target.value
                            updateQuizQuestion(idx, 'options', newOptions)
                          }}
                          className="bg-background/80 border-border/50"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </FormSection>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {courses.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No modules yet. Use the dock to add one.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orderedVenueKeys.map((venueKey) => {
                const byCategory = modulesByVenueAndCategory.get(venueKey)!
                const categoryKeys = Array.from(byCategory.keys()).sort(
                  (a, b) => {
                    if (a === CATEGORY_GENERAL_KEY) return 1
                    if (b === CATEGORY_GENERAL_KEY) return -1
                    return a.localeCompare(b, undefined, { sensitivity: 'base' })
                  }
                )
                const moduleCount = Array.from(byCategory.values()).reduce(
                  (n, list) => n + list.length,
                  0
                )

                return (
                  <details
                    key={venueKey}
                    className={`group rounded-2xl border-2 overflow-hidden ${VENUE_DETAILS_SHELL}`}
                  >
                    <summary
                      className={`flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 ${VENUE_DETAILS_SHELL} [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-black/25 p-1">
                          <img
                            src={logoSrcForVenueKey(venueKey)}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 text-left">
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">
                            {venueHeading(venueKey)}
                          </h2>
                          <p className="text-xs text-muted-foreground truncate tabular-nums">
                            {venueKey === VENUE_ALL_KEY
                              ? 'Every site'
                              : 'This venue only'}
                            {' · '}
                            {moduleCount}{' '}
                            {moduleCount === 1 ? 'module' : 'modules'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 shrink-0 text-spirits-yellow/90 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className={VENUE_DETAILS_INNER}>
                      <div className="space-y-8">
                        {categoryKeys.map((categoryKey, catIdx) => {
                          const list = byCategory.get(categoryKey)!
                          return (
                            <div key={`${venueKey}-${categoryKey}`}>
                              {catIdx > 0 ? (
                                <div
                                  className="mb-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                  aria-hidden
                                />
                              ) : null}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-border/40" />
                                <h3 className="text-sm font-semibold text-spirits-yellow shrink-0 px-1">
                                  {categoryHeading(categoryKey)}
                                </h3>
                                <div className="h-px flex-1 bg-border/40" />
                              </div>
                              <div className="space-y-2">
                                {list.map((course) => (
                                  <div
                                    key={course.id}
                                    className="flex min-h-11 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#1e1e1e] px-3 py-2.5 sm:px-4"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm text-foreground truncate">
                                        {course.title}
                                      </p>
                                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
                                        {course.moduleType}
                                        {course.duration != null
                                          ? ` · ${course.duration} min`
                                          : ''}
                                      </p>
                                    </div>
                                    {/* DC-14: inline delete confirmation — no window.confirm() */}
                                    <div className="flex items-center shrink-0">
                                      {confirmDeleteId === course.id ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground mr-1">Delete?</span>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteConfirm(course.id)}
                                            className="rounded-md px-2 py-1 text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 touch-manipulation"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleEdit(course)}
                                            className="rounded-lg p-2 text-muted-foreground active:bg-white/[0.08] active:text-foreground touch-manipulation"
                                            aria-label={`Edit ${course.title}`}
                                          >
                                            <Edit2 className="h-4 w-4" strokeWidth={1.75} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteClick(course.id)}
                                            className="rounded-lg p-2 ml-1 text-muted-foreground active:bg-red-500/15 active:text-red-400 touch-manipulation"
                                            aria-label={`Delete ${course.title}`}
                                          >
                                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </details>
                )
              })}
            </div>
          )}

      <p className="text-center text-xs text-muted-foreground pt-1">
        {courses.length}{' '}
        {courses.length === 1 ? 'module' : 'modules'}
      </p>
    </div>
  )
}
