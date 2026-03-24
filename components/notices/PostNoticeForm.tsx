'use client'

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import type { Notice } from '@/types/database'
import {
  NOTICES_POST_DOCK_CANCEL,
  NOTICES_POST_DOCK_STATE,
  NOTICES_POST_DOCK_SUBMIT,
} from '@/lib/notices-post-dock-bridge'

interface PostNoticeFormProps {
  notice?: Notice
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-white/[0.08] pt-8 first:border-t-0 first:pt-0 scroll-mt-20">
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

export function PostNoticeForm({ notice }: PostNoticeFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!notice

  const cancelHref = pathname?.startsWith('/notices/edit')
    ? '/notices'
    : '/dashboard'

  const formatDateTimeLocal = (isoString: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    expiresAt: notice?.expiresAt ? formatDateTimeLocal(notice.expiresAt) : '',
    pinned: notice?.pinned || false,
  })
  const [imageUrl, setImageUrl] = useState<string | null>(
    notice?.attachments && notice.attachments.length > 0
      ? notice.attachments[0]
      : null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    window.dispatchEvent(
      new CustomEvent(NOTICES_POST_DOCK_STATE, {
        detail: {
          saving: loading,
          uploading: uploadingImage,
          editing: isEditing,
        },
      })
    )
  }, [loading, uploadingImage, isEditing])

  useEffect(() => {
    const onSubmitDock = () => {
      formRef.current?.requestSubmit()
    }
    const onCancelDock = () => {
      router.push(cancelHref)
    }

    window.addEventListener(NOTICES_POST_DOCK_SUBMIT, onSubmitDock)
    window.addEventListener(NOTICES_POST_DOCK_CANCEL, onCancelDock)

    return () => {
      window.removeEventListener(NOTICES_POST_DOCK_SUBMIT, onSubmitDock)
      window.removeEventListener(NOTICES_POST_DOCK_CANCEL, onCancelDock)
    }
  }, [router, cancelHref])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const uploadBody = new FormData()
      uploadBody.append('file', file)

      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        body: uploadBody,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditing ? `/api/notices/${notice.id}` : '/api/notices'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
          attachments: imageUrl ? [imageUrl] : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.error ||
            `Failed to ${isEditing ? 'update' : 'create'} notice`
        )
      }

      router.push('/notices')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full pb-8">
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl">
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {isEditing ? 'Edit notice' : 'Post a notice'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed max-w-prose">
            {isEditing
              ? 'Update what staff see on the board. Cancel or save from the dock below.'
              : 'Write what staff need to know. Add an image or expiry if you want — then use the dock to post or cancel.'}
          </p>
        </header>

        <div className="space-y-10">
          <FormSection
            title="Message"
            hint="Title and body show on the notice board for all staff."
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Short headline"
                className="bg-background/80 border-border/50 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                placeholder="Full message…"
                rows={10}
                className="w-full min-h-[220px] rounded-xl border border-border/50 bg-background/80 px-3 py-3 text-sm leading-relaxed"
              />
            </div>
          </FormSection>

          <FormSection
            title="Image"
            hint="Optional. Shown with the notice. Max 5MB — JPG, PNG, or GIF."
          >
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border/50">
                <div className="relative h-56 w-full bg-muted sm:h-64">
                  <Image
                    src={imageUrl}
                    alt="Notice attachment preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="border-border/50"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {uploadingImage ? 'Uploading…' : 'Choose image'}
                </Button>
              </div>
            )}
          </FormSection>

          <FormSection
            title="Visibility"
            hint="Pinned notices stay at the top. Expiry hides the notice after that time."
          >
            <div className="space-y-2 max-w-md">
              <Label htmlFor="expiresAt">Expires (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="bg-background/80 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if the notice should not auto-hide
              </p>
            </div>
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) =>
                  setFormData({ ...formData, pinned: e.target.checked })
                }
                className="mt-1 h-4 w-4 shrink-0 rounded border-input bg-background accent-spirits-yellow"
              />
              <Label htmlFor="pinned" className="cursor-pointer leading-snug">
                Pin to top of the board
              </Label>
            </div>
          </FormSection>
        </div>
      </form>
    </div>
  )
}
