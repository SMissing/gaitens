'use client'

import * as React from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const DockContext = React.createContext<{
  activeItem: string | null
  setActiveItem: (item: string | null) => void
}>({
  activeItem: null,
  setActiveItem: () => {},
})

export function useDockContext() {
  const context = React.useContext(DockContext)
  if (!context) {
    throw new Error('useDockContext must be used within a Dock component')
  }
  return context
}

interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, children, ...props }, ref) => {
    const [activeItem, setActiveItem] = React.useState<string | null>(null)
    const dockRef = React.useRef<HTMLDivElement | null>(null)

    // Close overlay when clicking outside (but not on overlay content)
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        if (dockRef.current && dockRef.current.contains(target)) {
          return
        }
        setActiveItem(null)
      }

      if (activeItem) {
        // Use a small delay to avoid immediate closure
        const timeout = setTimeout(() => {
          document.addEventListener('mousedown', handleClickOutside)
        }, 100)
        return () => {
          clearTimeout(timeout)
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }
    }, [activeItem])

    return (
      <DockContext.Provider value={{ activeItem, setActiveItem }}>
        <div
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
            dockRef.current = node
          }}
          className={cn(
            'relative flex flex-col items-center transition-all duration-300 ease-out',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </DockContext.Provider>
    )
  }
)
Dock.displayName = 'Dock'

interface DockItemProps extends React.HTMLAttributes<HTMLDivElement> {
  itemId: string
  children: React.ReactNode
  hasSubmenu?: boolean
}

const DockItem = React.forwardRef<HTMLDivElement, DockItemProps>(
  ({ className, itemId, children, hasSubmenu, ...props }, ref) => {
    const { activeItem, setActiveItem } = React.useContext(DockContext)
    const isActive = activeItem === itemId

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col items-center group',
          className
        )}
        {...props}
      >
        {hasSubmenu && (
          <ChevronUp
            className={cn(
              'absolute -top-2 left-1/2 -translate-x-1/2 h-2.5 w-2.5 transition-colors pointer-events-none',
              isActive ? 'text-spirits-cyan' : 'text-foreground/25'
            )}
          />
        )}
        <div
          onClick={() => setActiveItem(isActive ? null : itemId)}
          className={cn(
            "cursor-pointer transition-all duration-200 touch-manipulation rounded-lg p-2",
            "active:scale-95 sm:hover:scale-105",
            isActive && "bg-spirits-cyan/20 scale-105 sm:scale-110"
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
DockItem.displayName = 'DockItem'

const DockIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center h-12 w-12 sm:h-12 sm:w-12 flex-shrink-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DockIcon.displayName = 'DockIcon'

const DockLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap',
        'px-2 py-1 bg-card border border-border rounded-md shadow-sm',
        'opacity-0 pointer-events-none transition-opacity duration-200',
        'group-hover:opacity-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DockLabel.displayName = 'DockLabel'

interface DockAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  itemId: string
  children: React.ReactNode
}

const DockAccordion = React.forwardRef<HTMLDivElement, DockAccordionProps>(
  ({ className, itemId, children, ...props }, ref) => {
    const { activeItem } = React.useContext(DockContext)
    const isActive = activeItem === itemId

    return (
      <>
        {isActive && (
          <div
            ref={ref}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 w-full z-40',
              'transition-all duration-300 ease-out',
              isActive
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none',
              className
            )}
            {...props}
          >
            <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-lg shadow-xl p-3 mx-auto max-w-md">
              {children}
            </div>
          </div>
        )}
      </>
    )
  }
)
DockAccordion.displayName = 'DockAccordion'

interface DockIconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  itemId: string
  children: React.ReactNode
}

const DockIconCircle = React.forwardRef<HTMLDivElement, DockIconCircleProps>(
  ({ className, itemId, children, ...props }, ref) => {
    const { activeItem } = React.useContext(DockContext)
    const isActive = activeItem === itemId

    return (
      <div
        ref={ref}
        className={cn(
          'aspect-square rounded-full bg-card border flex items-center justify-center active:bg-accent sm:hover:bg-accent transition-all h-full w-full touch-manipulation',
          isActive
            ? 'border-spirits-cyan shadow-[0_0_20px_rgba(0,217,255,0.5)] shadow-spirits-cyan/50'
            : 'border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DockIconCircle.displayName = 'DockIconCircle'

export { Dock, DockItem, DockIcon, DockLabel, DockAccordion, DockIconCircle }
