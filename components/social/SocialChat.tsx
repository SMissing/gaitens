'use client'

import { useEffect, useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/date-utils'
import type { Message } from '@/types/database'
import type { User } from '@/types/database'

interface MessageWithUser extends Message {
  users: User | null
}

interface SocialChatProps {
  initialMessages: MessageWithUser[]
  currentUserId: string
}

export function SocialChat({ initialMessages, currentUserId }: SocialChatProps) {
  // Sort initial messages by createdAt ascending (oldest first) for chat display
  const sortedInitialMessages = [...initialMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const [messages, setMessages] = useState<MessageWithUser[]>(sortedInitialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages?limit=50&offset=0')
        if (response.ok) {
          const data = await response.json()
          // Sort messages by createdAt ascending (oldest first) for chat display
          const sortedMessages = (data.messages || []).sort((a: MessageWithUser, b: MessageWithUser) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          setMessages(sortedMessages)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    // Initial fetch
    fetchMessages()

    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent }),
      })

      if (response.ok) {
        const data = await response.json()
        // Fetch latest messages to ensure consistency
        const fetchResponse = await fetch('/api/messages?limit=50&offset=0')
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json()
          // Sort messages by createdAt ascending (oldest first) for chat display
          const sortedMessages = (fetchData.messages || []).sort((a: MessageWithUser, b: MessageWithUser) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          setMessages(sortedMessages)
        }
      } else {
        // Restore message if send failed
        setNewMessage(messageContent)
        const errorData = await response.json()
        alert(errorData.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-0 overflow-hidden">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-none px-2 sm:px-3 lg:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0 relative z-10"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-muted-foreground text-sm sm:text-base text-center">No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUserId
              const userName = message.users?.name || 'Unknown'
              const userSite = message.users?.site || null

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[70%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                      isOwnMessage
                        ? 'bg-spirits-cyan/20 border border-spirits-cyan/30'
                        : 'bg-[#1e1e1e]/60 backdrop-blur-md border border-border/30'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {userName}
                        </span>
                        {userSite && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            • {userSite}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                    <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div 
        className="bg-background/95 backdrop-blur-lg border-t border-border/30 flex-shrink-0 relative"
        style={{
          paddingTop: '0.25rem',
          paddingBottom: `calc(max(0.25rem, env(safe-area-inset-bottom, 0px)) + 100px)`,
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          marginBottom: '-100px', // Extend container off-screen
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        {/* Extended blur background - continues the container's blur off-screen */}
        <div 
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: '100%',
            height: '100px',
            background: 'oklch(0.08 0 0 / 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: -1,
          }}
        />
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3 relative z-10">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message"
              className="w-full min-h-[36px] max-h-24 resize-none bg-[#1e1e1e]/80 border border-border/40 focus:border-spirits-cyan/60 focus:bg-[#1e1e1e] text-sm rounded-2xl px-3 py-2 pr-10 sm:pr-12 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              disabled={isSending}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-spirits-cyan hover:bg-spirits-cyan-dark text-background min-h-[36px] min-w-[36px] h-[36px] w-[36px] rounded-full p-0 flex items-center justify-center touch-manipulation active:scale-95 flex-shrink-0 shadow-lg shadow-spirits-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
