'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteBlogPostButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onDelete() {
    if (!confirm('Delete this blog post? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to delete')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-red-400 border-red-900/50 hover:bg-red-950/40"
      disabled={loading}
      onClick={onDelete}
      aria-label="Delete post"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
