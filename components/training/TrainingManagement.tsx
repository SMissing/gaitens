'use client'

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Play,
  BookOpen,
  FileText,
  Users,
} from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { staffListFromApiResponse } from '@/lib/staff-permissions'
import {
  TRAINING_DOCK_ADD,
  TRAINING_DOCK_CLOSE_FORM,
  TRAINING_DOCK_SUBMIT_FORM,
  TRAINING_DOCK_REFRESH,
  TRAINING_DOCK_STATE,
  TRAINING_DOCK_NEXT_STEP,
  TRAINING_DOCK_PREV_STEP,
} from '@/lib/training-dock-bridge'

// ── Constants ─────────────────────────────────────────────────────────────────

const VENUE_ALL_KEY = '__all_venues__'
const CATEGORY_GENERAL_KEY = '__general__'
const LAST_STEP = 3

const STEP_META = [
  { label: 'Basics',   heading: 'Name your module',      sub: 'What staff see in the training list.' },
  { label: 'Audience', heading: 'Who needs this?',        sub: 'Set the venue, requirement, and category.' },
  { label: 'Content',  heading: 'What will they learn?',  sub: 'Add sections, a video link, or both.' },
  { label: 'Quiz',     heading: 'Test their knowledge',   sub: 'Multiple choice questions — optional.' },
] as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function venueDisplayKey(site: string | null | undefined): string {
  const s = site?.trim()
  return s ? s : VENUE_ALL_KEY
}

function venueHeading(siteKey: string): string {
  return siteKey === VENUE_ALL_KEY ? 'All venues' : siteKey
}

function categoryHeading(categoryKey: string): string {
  return categoryKey === CATEGORY_GENERAL_KEY ? 'General' : categoryKey
}

function logoSrcForVenueKey(venueKey: string): string {
  if (venueKey === VENUE_ALL_KEY) return '/logos/gaitens-logo-white.png'
  const n = venueKey.toLowerCase()
  if (n.includes('garrison')) return '/logos/garrison-logo-white.png'
  if (n.includes('spirit'))   return '/logos/spirits-logo.png'
  if (n.includes('bassment')) return '/logos/bassment-logo.png'
  return '/logos/gaitens-logo-white.png'
}

// ── Content section helpers ───────────────────────────────────────────────────

interface ContentSection { title: string; body: string }

const defaultSection = (): ContentSection => ({ title: '', body: '' })

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

function stripToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function htmlToSections(html: string | null | undefined): ContentSection[] {
  if (!html?.trim()) return [defaultSection()]
  const hasHeadings = /<h[23][\s>]/i.test(html)
  if (hasHeadings) {
    const parts = html.split(/(?=<h[23][\s>])/i).filter(p => p.trim())
    const sections = parts.map(part => {
      const headingMatch = part.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i)
      const title = headingMatch ? headingMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      const bodyHtml = part.replace(/<h[23][^>]*>[\s\S]*?<\/h[23]>/i, '')
      return { title, body: stripToText(bodyHtml) }
    }).filter(s => s.title || s.body)
    if (sections.length > 0) return sections
  }
  const body = stripToText(html)
  return [{ title: '', body: body || html.trim() }]
}

// ── Form defaults ─────────────────────────────────────────────────────────────

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
  quizQuestions: [] as Array<{ question: string; options: string[]; correctAnswer: number }>,
})

// ── Option row component (radio-style) ────────────────────────────────────────

function OptionRow({
  selected,
  onClick,
  label,
  description,
  accent = 'yellow',
}: {
  selected: boolean
  onClick: () => void
  label: string
  description?: string
  accent?: 'yellow' | 'cyan'
}) {
  const ring = accent === 'yellow'
    ? 'border-spirits-yellow/60 bg-spirits-yellow/8'
    : 'border-spirits-cyan/60 bg-spirits-cyan/8'
  const dot = accent === 'yellow' ? 'bg-spirits-yellow border-spirits-yellow' : 'bg-spirits-cyan border-spirits-cyan'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]',
        selected ? ring : 'border-white/10 bg-white/[0.03] hover:border-white/20',
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
        selected ? dot : 'border-white/30',
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="min-w-0">
        <p className={cn('font-bold text-base leading-tight', selected ? 'text-foreground' : 'text-white/70')}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TrainingManagement() {
  const formRef = useRef<HTMLFormElement>(null)
  const [courses, setCourses] = useState<Array<TrainingCourse & { users?: { name: string } }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sites, setSites] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState(emptyForm)
  const [sections, setSections] = useState<ContentSection[]>([defaultSection()])
  const [sectionsModified, setSectionsModified] = useState(false)

  // ── Grouped list ─────────────────────────────────────────────────────────
  const modulesByVenueAndCategory = useMemo(() => {
    const outer = new Map<string, Map<string, TrainingCourse[]>>()
    for (const c of courses) {
      const vKey = venueDisplayKey(c.site)
      const cKey = c.category?.trim() ? c.category.trim() : CATEGORY_GENERAL_KEY
      if (!outer.has(vKey)) outer.set(vKey, new Map())
      const inner = outer.get(vKey)!
      if (!inner.has(cKey)) inner.set(cKey, [])
      inner.get(cKey)!.push(c)
    }
    for (const inner of outer.values())
      for (const list of inner.values())
        list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    return outer
  }, [courses])

  const orderedVenueKeys = useMemo(() => {
    const keys = Array.from(modulesByVenueAndCategory.keys())
    return keys.sort((a, b) => {
      if (a === VENUE_ALL_KEY) return -1
      if (b === VENUE_ALL_KEY) return 1
      return a.localeCompare(b, undefined, { sensitivity: 'base' })
    })
  }, [modulesByVenueAndCategory])

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/staff?active=true')
      if (res.ok) {
        const data = await res.json()
        const staff = staffListFromApiResponse(data)
        setSites(Array.from(new Set(staff.map((s: { site?: string | null }) => s.site).filter(Boolean))) as string[])
      }
    } catch {}
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/training?all=true')
      if (res.ok) setCourses(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCourses()
    void fetchSites()
  }, [fetchCourses, fetchSites])

  // ── Dock state broadcast ──────────────────────────────────────────────────
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(TRAINING_DOCK_STATE, {
      detail: {
        formOpen: showForm,
        listLoading: loading,
        saving,
        editing: editingCourse != null,
        formStep: activeStep,
        onLastStep: activeStep === LAST_STEP,
        canAdvance: activeStep !== 0 || formData.title.trim().length > 0,
      },
    }))
  }, [showForm, loading, saving, editingCourse, activeStep, formData.title])

  // ── Form open/close ───────────────────────────────────────────────────────
  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingCourse(null)
    setSaveError(null)
    setActiveStep(0)
    setFormData(emptyForm())
    setSections([defaultSection()])
    setSectionsModified(false)
  }, [])

  const goNextStep = useCallback(() => {
    if (activeStep < LAST_STEP) setActiveStep(s => s + 1)
    else formRef.current?.requestSubmit()
  }, [activeStep])

  const goPrevStep = useCallback(() => {
    if (activeStep > 0) setActiveStep(s => s - 1)
    else closeForm()
  }, [activeStep, closeForm])

  // ── Dock event listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const onAdd = () => {
      setSaveError(null); setEditingCourse(null)
      setFormData(emptyForm()); setSections([defaultSection()])
      setSectionsModified(false); setActiveStep(0); setShowForm(true)
    }
    const onClose   = () => closeForm()
    const onRefresh = () => { void fetchCourses(); void fetchSites() }
    const onSubmit  = () => formRef.current?.requestSubmit()
    const onNext    = () => goNextStep()
    const onPrev    = () => goPrevStep()

    window.addEventListener(TRAINING_DOCK_ADD,        onAdd)
    window.addEventListener(TRAINING_DOCK_CLOSE_FORM, onClose)
    window.addEventListener(TRAINING_DOCK_SUBMIT_FORM, onSubmit)
    window.addEventListener(TRAINING_DOCK_REFRESH,    onRefresh)
    window.addEventListener(TRAINING_DOCK_NEXT_STEP,  onNext)
    window.addEventListener(TRAINING_DOCK_PREV_STEP,  onPrev)
    return () => {
      window.removeEventListener(TRAINING_DOCK_ADD,        onAdd)
      window.removeEventListener(TRAINING_DOCK_CLOSE_FORM, onClose)
      window.removeEventListener(TRAINING_DOCK_SUBMIT_FORM, onSubmit)
      window.removeEventListener(TRAINING_DOCK_REFRESH,    onRefresh)
      window.removeEventListener(TRAINING_DOCK_NEXT_STEP,  onNext)
      window.removeEventListener(TRAINING_DOCK_PREV_STEP,  onPrev)
    }
  }, [closeForm, fetchCourses, fetchSites, goNextStep, goPrevStep])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaveError(null)
    try {
      const url    = editingCourse ? `/api/training/${editingCourse}` : '/api/training'
      const method = editingCourse ? 'PUT' : 'POST'
      const payload = {
        ...formData,
        content: sectionsModified ? sectionsToHtml(sections) : (formData.content || ''),
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
        site: formData.site || null,
        category: formData.category || null,
        requiredScope: formData.requiredScope,
        quizQuestions: formData.quizQuestions.length > 0 ? formData.quizQuestions : [],
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to save')
      closeForm(); await fetchCourses()
    } catch {
      setSaveError('Could not save this module. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (course: TrainingCourse) => {
    setSaveError(null)
    setFormData({
      title: course.title, description: course.description || '',
      videoUrl: course.videoUrl || '', content: course.content || '',
      site: course.site || '', requiredScope: course.requiredScope ?? 'none',
      category: course.category || '', moduleType: course.moduleType,
      duration: course.duration?.toString() || '', quizQuestions: course.quizQuestions || [],
    })
    setSections(htmlToSections(course.content))
    setSectionsModified(false); setActiveStep(0)
    setEditingCourse(course.id); setShowForm(true)
  }

  const handleDeleteClick   = (id: string) => setConfirmDeleteId(id)
  const handleDeleteConfirm = async (id: string) => {
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/training/${id}`, { method: 'DELETE' })
      if (res.ok) void fetchCourses()
    } catch {}
  }

  const addQuizQuestion = () =>
    setFormData({ ...formData, quizQuestions: [...formData.quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] })

  const updateQuizQuestion = (index: number, field: string, value: unknown) => {
    const updated = [...formData.quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, quizQuestions: updated })
  }

  const removeQuizQuestion = (index: number) =>
    setFormData({ ...formData, quizQuestions: formData.quizQuestions.filter((_, i) => i !== index) })

  // ── Form view ─────────────────────────────────────────────────────────────
  if (showForm) {
    const progress = ((activeStep + 1) / 4) * 100

    return (
      <div className="w-full">
        {/* Thin progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-spirits-yellow"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Step breadcrumb */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-spirits-yellow/70">
            Step {activeStep + 1} of 4
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            {STEP_META[activeStep].label}
          </span>
        </div>

        {saveError && (
          <div className="mx-5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {saveError}
          </div>
        )}

        {/* Step heading — outside AnimatePresence so it stays at top while scrolling long step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`heading-${activeStep}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="px-5 pt-2 pb-6"
          >
            <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              {STEP_META[activeStep].heading}
            </h2>
            <p className="text-sm text-white/45 mt-1.5">{STEP_META[activeStep].sub}</p>
          </motion.div>
        </AnimatePresence>

        <form ref={formRef} onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="px-5 pb-8"
            >
              {/* ── Step 0: Basics ─────────────────────────────────── */}
              {activeStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/70">
                      Module title <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Opening Checklist"
                      required
                      autoFocus
                      className="w-full rounded-2xl border-2 border-white/10 bg-white/[0.05] px-5 py-4 text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-spirits-yellow/60 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">
                      Description <span className="text-white/20 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="One-line summary"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { value: 'video' as const, label: 'Video only',     sub: 'A video link',  Icon: Play     },
                          { value: 'text'  as const, label: 'Reading only',   sub: 'Text sections', Icon: FileText },
                          { value: 'guide' as const, label: 'Video + Reading', sub: 'Both combined', Icon: BookOpen },
                        ]
                      ).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, moduleType: opt.value })}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-bold transition-all duration-150 active:scale-95',
                            formData.moduleType === opt.value
                              ? 'border-spirits-yellow/60 bg-spirits-yellow/10 text-spirits-yellow'
                              : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20',
                          )}
                        >
                          <opt.Icon className={cn(
                            'h-7 w-7',
                            formData.moduleType === opt.value ? 'text-spirits-yellow' : 'text-white/40',
                          )} />
                          <span className="font-bold text-xs leading-tight text-center">{opt.label}</span>
                          <span className={cn(
                            'text-[10px] leading-tight text-center',
                            formData.moduleType === opt.value ? 'text-spirits-yellow/60' : 'text-white/25',
                          )}>
                            {opt.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 max-w-[12rem]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">
                      Duration <span className="text-white/20 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="5"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors pr-14"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-white/25 pointer-events-none">min</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Audience ───────────────────────────────── */}
              {activeStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/70">Venue</label>
                    <div className="space-y-2">
                      <OptionRow
                        selected={formData.site === ''}
                        onClick={() => setFormData({ ...formData, site: '', category: '' })}
                        label="All venues"
                        description="Applies to every staff member"
                      />
                      {sites.map(site => (
                        <OptionRow
                          key={site}
                          selected={formData.site === site}
                          onClick={() => setFormData({ ...formData, site, category: '' })}
                          label={site}
                          description="This venue only"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">Required?</label>
                    <div className="space-y-2">
                      {([
                        { value: 'none', label: 'Optional',           description: 'Not tracked as required completion' },
                        { value: 'site', label: 'Required — this venue', description: 'Must complete if assigned to the venue above' },
                        { value: 'all',  label: 'Required — everyone', description: 'All staff must complete regardless of venue' },
                      ] as const).map(opt => (
                        <OptionRow
                          key={opt.value}
                          selected={formData.requiredScope === opt.value}
                          onClick={() => setFormData({ ...formData, requiredScope: opt.value })}
                          label={opt.label}
                          description={opt.description}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">
                      Category label <span className="text-white/20 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Bar, Kitchen, Safety"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <p className="text-xs text-white/25">Groups modules on the training path</p>
                  </div>
                </div>
              )}

              {/* ── Step 2: Content ────────────────────────────────── */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  {(formData.moduleType === 'video' || formData.moduleType === 'guide') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/70">
                        Video link
                        {formData.moduleType === 'guide' && (
                          <span className="ml-2 font-normal normal-case text-white/30">+ text sections below</span>
                        )}
                      </label>
                      <input
                        value={formData.videoUrl}
                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/… or direct .mp4"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  )}

                  {formData.moduleType !== 'video' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/35">
                      {formData.moduleType === 'guide' ? 'Text sections' : 'Content sections'}
                      <span className="ml-2 text-white/20 font-normal normal-case">(each becomes a separate page)</span>
                    </label>

                    {sections.map((section, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/60">
                            Section {idx + 1}
                          </span>
                          {sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => { setSections(s => s.filter((_, i) => i !== idx)); setSectionsModified(true) }}
                              className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              aria-label="Remove section"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>
                          )}
                        </div>
                        <input
                          value={section.title}
                          onChange={e => {
                            const updated = [...sections]
                            updated[idx] = { ...updated[idx], title: e.target.value }
                            setSections(updated); setSectionsModified(true)
                          }}
                          placeholder="Heading (optional)"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                        />
                        <textarea
                          value={section.body}
                          onChange={e => {
                            const updated = [...sections]
                            updated[idx] = { ...updated[idx], body: e.target.value }
                            setSections(updated); setSectionsModified(true)
                          }}
                          rows={4}
                          placeholder="Content for this section. Press Enter twice for a new paragraph."
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white leading-relaxed placeholder:text-white/20 resize-y focus:outline-none focus:border-white/25 transition-colors"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => { setSections(s => [...s, defaultSection()]); setSectionsModified(true) }}
                      className="flex items-center gap-2 rounded-2xl border border-spirits-yellow/30 bg-spirits-yellow/5 px-4 py-3 text-sm font-bold text-spirits-yellow/80 hover:bg-spirits-yellow/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add section
                    </button>
                  </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Quiz ───────────────────────────────────── */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/45">
                      {formData.quizQuestions.length === 0
                        ? 'No questions yet — you can skip this step.'
                        : `${formData.quizQuestions.length} question${formData.quizQuestions.length === 1 ? '' : 's'}`}
                    </p>
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="flex items-center gap-2 rounded-2xl border border-spirits-yellow/30 bg-spirits-yellow/5 px-4 py-2.5 text-sm font-bold text-spirits-yellow/80 hover:bg-spirits-yellow/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add question
                    </button>
                  </div>

                  {formData.quizQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border-l-2 border-spirits-yellow/40 bg-white/[0.03] pl-5 pr-4 py-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/60">
                          Q{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuizQuestion(idx)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                      <input
                        placeholder="Type the question"
                        value={q.question}
                        onChange={e => updateQuizQuestion(idx, 'question', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white font-medium placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Answers — tap the circle to mark correct
                      </p>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuizQuestion(idx, 'correctAnswer', optIdx)}
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                              q.correctAnswer === optIdx
                                ? 'border-spirits-yellow bg-spirits-yellow'
                                : 'border-white/30',
                            )}
                          >
                            {q.correctAnswer === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                          </button>
                          <input
                            placeholder={`Answer ${optIdx + 1}`}
                            value={opt}
                            onChange={e => {
                              const newOptions = [...q.options]
                              newOptions[optIdx] = e.target.value
                              updateQuizQuestion(idx, 'options', newOptions)
                            }}
                            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Hero header */}
      <div className="px-5 pt-6 pb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">
          Gaitens Leisure
        </p>
        <h1 className="text-4xl font-black text-white leading-none tracking-tight">
          Module
          <br />
          <span className="text-white/90">Maker</span>
        </h1>
        <Link
          href="/manager/staff-training"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          <Users className="h-3.5 w-3.5" />
          View staff progress →
        </Link>

        {!loading && courses.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-spirits-yellow/15 text-spirits-yellow rounded-2xl px-3 py-1.5 border border-spirits-yellow/20">
              <span className="font-black text-sm tabular-nums">{courses.length}</span>
              <span className="text-xs text-spirits-yellow/60 font-medium">
                {courses.length === 1 ? 'module' : 'modules'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {loading && courses.length === 0 ? (
          // Skeleton
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] py-16 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-white/40 text-sm">No modules yet.</p>
            <p className="text-white/25 text-xs mt-1">Use the dock below to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderedVenueKeys.map(venueKey => {
              const byCategory = modulesByVenueAndCategory.get(venueKey)!
              const categoryKeys = Array.from(byCategory.keys()).sort((a, b) => {
                if (a === CATEGORY_GENERAL_KEY) return 1
                if (b === CATEGORY_GENERAL_KEY) return -1
                return a.localeCompare(b, undefined, { sensitivity: 'base' })
              })
              const moduleCount = Array.from(byCategory.values()).reduce((n, list) => n + list.length, 0)

              return (
                <details
                  key={venueKey}
                  className="group rounded-2xl border-2 border-spirits-yellow/25 bg-spirits-yellow/[0.04] overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5 [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 p-1.5">
                        <img
                          src={logoSrcForVenueKey(venueKey)}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <h2 className="text-base font-bold text-white">{venueHeading(venueKey)}</h2>
                        <p className="text-xs text-white/35 tabular-nums">
                          {venueKey === VENUE_ALL_KEY ? 'Every site' : 'This venue only'}
                          {' · '}
                          {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-spirits-yellow/60 transition-transform duration-200 group-open:rotate-180" />
                  </summary>

                  <div className="border-t border-white/10 bg-[#0f0f1e] px-3 pb-3 pt-3 space-y-6">
                    {categoryKeys.map(categoryKey => {
                      const list = byCategory.get(categoryKey)!
                      return (
                        <div key={`${venueKey}-${categoryKey}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-px flex-1 bg-white/[0.08]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-spirits-yellow/50 px-1">
                              {categoryHeading(categoryKey)}
                            </span>
                            <div className="h-px flex-1 bg-white/[0.08]" />
                          </div>

                          <div className="space-y-1.5">
                            {list.map(course => (
                              <div
                                key={course.id}
                                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                              >
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40">
                                  {course.moduleType === 'video'
                                    ? <Play className="h-3.5 w-3.5" />
                                    : course.moduleType === 'guide'
                                    ? <BookOpen className="h-3.5 w-3.5" />
                                    : <FileText className="h-3.5 w-3.5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-white truncate">{course.title}</p>
                                  <p className="text-[11px] text-white/35 truncate">
                                    {course.moduleType === 'video' ? 'Video' : course.moduleType === 'guide' ? 'Video + Reading' : 'Reading'}
                                    {course.duration != null ? ` · ${course.duration} min` : ''}
                                    {course.requiredScope !== 'none' ? ' · Required' : ''}
                                  </p>
                                </div>

                                {confirmDeleteId === course.id ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-xs text-white/35 mr-1">Delete?</span>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="rounded-lg px-2 py-1 text-xs text-white/40 hover:text-white touch-manipulation"
                                    >
                                      No
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteConfirm(course.id)}
                                      className="rounded-lg px-2 py-1 text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 touch-manipulation"
                                    >
                                      Yes
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(course)}
                                      className="rounded-lg p-2 text-white/30 active:bg-white/[0.08] active:text-white touch-manipulation"
                                      aria-label={`Edit ${course.title}`}
                                    >
                                      <Edit2 className="h-4 w-4" strokeWidth={1.75} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClick(course.id)}
                                      className="rounded-lg p-2 ml-0.5 text-white/30 active:bg-red-500/15 active:text-red-400 touch-manipulation"
                                      aria-label={`Delete ${course.title}`}
                                    >
                                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
