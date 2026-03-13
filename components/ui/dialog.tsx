'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogContextType {
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | null>(null)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted || !open) return null

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  const context = useContext(DialogContext)
  const handleClose = () => context?.onOpenChange(false)

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[90vh] bg-[#1e1e1e] rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 sm:p-6 border-b border-border/50 pr-12", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl sm:text-2xl font-bold text-foreground", className)}>
      {children}
    </h2>
  )
}
