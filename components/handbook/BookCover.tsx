'use client'

import { useRouter } from 'next/navigation'

interface BookCoverProps {
  id: string
  title: string
  coverImage?: string
}

export function BookCover({ id, title, coverImage }: BookCoverProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/handbook?book=${id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden"
    >
      {/* Book Cover Image */}
      {coverImage && (
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
    </button>
  )
}
