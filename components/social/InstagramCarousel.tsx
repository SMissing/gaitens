'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react'

interface InstagramPost {
  id: string
  permalink: string
  media_url?: string
  thumbnail_url?: string
  caption?: string
  timestamp?: string
  username: string
}

interface InstagramAccount {
  username: string
  displayName: string
  posts: InstagramPost[]
}

interface InstagramCarouselProps {
  accounts: InstagramAccount[]
}

export function InstagramCarousel({ accounts }: InstagramCarouselProps) {
  const [scrollStates, setScrollStates] = useState<Record<string, { canScrollLeft: boolean; canScrollRight: boolean }>>({})

  const checkScrollability = (username: string, container: HTMLDivElement) => {
    const { scrollLeft, scrollWidth, clientWidth } = container
    setScrollStates(prev => ({
      ...prev,
      [username]: {
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < scrollWidth - clientWidth - 10
      }
    }))
  }

  const scroll = (username: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-container-${username}`) as HTMLDivElement
    if (!container) return
    
    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  if (!accounts || accounts.length === 0) {
    return null
  }

  return (
    <Card className="bg-[#1e1e1e]/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-lg">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 flex-shrink-0" />
          Social Media Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-6">
          {accounts.map((account, accountIndex) => (
            <div key={account.username} className="space-y-3">
              {/* Account Header */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {account.displayName}
                </h3>
                <span className="text-xs text-muted-foreground">@{account.username}</span>
              </div>

              {/* Posts Carousel */}
              {account.posts && account.posts.length > 0 ? (
                <div className="relative">
                  {/* Scroll Container */}
                  <div
                    id={`scroll-container-${account.username}`}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                    onScroll={(e) => {
                      const target = e.currentTarget
                      checkScrollability(account.username, target)
                    }}
                    ref={(el) => {
                      if (el) {
                        checkScrollability(account.username, el)
                      }
                    }}
                  >
                    {account.posts.map((post) => (
                      <a
                        key={post.id}
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[280px] sm:w-[320px] group"
                      >
                        <div className="bg-card/50 rounded-xl overflow-hidden border border-border/30 hover:border-border/50 transition-all hover:shadow-lg active:scale-95">
                          {/* Post Image */}
                          <div className="aspect-square bg-muted relative overflow-hidden">
                            {post.media_url || post.thumbnail_url ? (
                              <img
                                src={post.media_url || post.thumbnail_url}
                                alt={post.caption || 'Instagram post'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Instagram className="h-12 w-12 text-muted-foreground/50" />
                              </div>
                            )}
                            {/* Instagram Icon Overlay */}
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                              <Instagram className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          
                          {/* Post Caption Preview */}
                          {post.caption && (
                            <div className="p-2 sm:p-3">
                              <p className="text-xs sm:text-sm text-foreground line-clamp-2">
                                {post.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Scroll Buttons - Desktop Only */}
                  {scrollStates[account.username]?.canScrollLeft && (
                    <button
                      onClick={() => scroll(account.username, 'left')}
                      className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-card/90 hover:bg-card border border-border rounded-full p-2 shadow-lg z-10 transition-all hover:scale-110"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                  {scrollStates[account.username]?.canScrollRight && (
                    <button
                      onClick={() => scroll(account.username, 'right')}
                      className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-card/90 hover:bg-card border border-border rounded-full p-2 shadow-lg z-10 transition-all hover:scale-110"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No posts available
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
