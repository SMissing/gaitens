'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  /** When true this item is rendered as a non-interactive group header */
  isHeader?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; width: number } | null>(null)
  const selectRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  const selectableOptions = options.filter((o) => !o.isHeader)
  const selectedOption = selectableOptions.find(opt => opt.value === value)

  // Ensure component is mounted before using portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position when opening
  const updateDropdownPosition = React.useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Use viewport coordinates for fixed positioning
      setDropdownPosition({
        top: rect.bottom, // Locked to bottom of button (viewport coordinates)
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isClickOnButton = buttonRef.current?.contains(target)
      const isClickOnDropdown = dropdownRef.current?.contains(target)
      const isClickOnSelect = selectRef.current?.contains(target)
      
      // Only close if click is outside both the select container and the dropdown menu
      if (!isClickOnButton && !isClickOnDropdown && !isClickOnSelect) {
        setIsOpen(false)
        setFocusedIndex(null)
        setDropdownPosition(null)
      }
    }

    if (isOpen) {
      updateDropdownPosition()
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('resize', updateDropdownPosition)
      
      // Use requestAnimationFrame for smooth updates during scroll
      let rafId: number | null = null
      const handleScroll = () => {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(updateDropdownPosition)
      }
      
      // Listen to scroll on window and all scrollable parents (capture phase)
      window.addEventListener('scroll', handleScroll, true)
      document.addEventListener('scroll', handleScroll, true)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('resize', updateDropdownPosition)
        window.removeEventListener('scroll', handleScroll, true)
        document.removeEventListener('scroll', handleScroll, true)
        if (rafId) cancelAnimationFrame(rafId)
      }
    }
  }, [isOpen, updateDropdownPosition])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else if (focusedIndex !== null && !options[focusedIndex]?.isHeader) {
          handleSelect(options[focusedIndex].value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(null)
        buttonRef.current?.focus()
        break
      case 'ArrowDown': {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => {
            let next = prev === null ? 0 : prev + 1
            while (next < options.length && options[next]?.isHeader) next++
            return Math.min(next, options.length - 1)
          })
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex((prev) => {
            let next = prev === null ? options.length - 1 : prev - 1
            while (next >= 0 && options[next]?.isHeader) next--
            return Math.max(next, 0)
          })
        }
        break
      }
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    setFocusedIndex(null)
    setDropdownPosition(null)
    buttonRef.current?.focus()
  }

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition()
      }
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex min-h-[44px] h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background touch-manipulation',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <span className={cn(
          'truncate',
          !selectedOption && 'text-muted-foreground'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 opacity-50 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && mounted && dropdownPosition && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => {
              // Only close if clicking directly on backdrop, not on dropdown
              if (e.target === e.currentTarget) {
                setIsOpen(false)
                setFocusedIndex(null)
                setDropdownPosition(null)
              }
            }}
          />
          
          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-xl border border-border shadow-lg"
            style={{ 
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              backgroundColor: 'oklch(0.2050 0 0)', // Solid card background color
              opacity: 1 
            }}
            role="listbox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-60 overflow-auto p-1">
              {selectableOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                options.map((option, index) =>
                  option.isHeader ? (
                    <div
                      key={`header-${option.label}-${index}`}
                      className="px-2 pb-0.5 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:pt-1"
                    >
                      {option.label}
                    </div>
                  ) : (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={value === option.value}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={cn(
                        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm',
                        'outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground',
                        value === option.value && 'bg-accent text-accent-foreground',
                        focusedIndex === index && 'bg-accent text-accent-foreground',
                      )}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {value === option.value && (
                        <Check className="ml-2 h-4 w-4 shrink-0" />
                      )}
                    </button>
                  ),
                )
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Hidden input for form submission */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required={required}
          aria-required={required}
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          onChange={() => {}} // Controlled by Select component
        />
      )}
    </div>
  )
}
