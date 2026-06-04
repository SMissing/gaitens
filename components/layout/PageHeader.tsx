'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LogoutButton from './LogoutButton'

interface PageHeaderProps {
  title?: string
  icon?: ReactNode
  logo?: string
  logoAlt?: string
  description?: string
  showLogout?: boolean
  showBack?: boolean
  backHref?: string
  /** e.g. achievements grid/list toggle — aligned top-right */
  rightSlot?: ReactNode
}

export function PageHeader({
  title,
  icon,
  logo,
  logoAlt,
  description,
  showLogout = false,
  showBack = false,
  backHref = '/dashboard',
  rightSlot,
}: PageHeaderProps) {
  return (
    <>
      {/* Header - extends into safe area */}
      <header 
        className="w-full bg-[oklch(0.08_0_0)]/90 backdrop-blur-md border-b border-border/50 fixed top-0 left-0 right-0 z-50"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div
            className={cn(
              'relative flex min-h-[44px] flex-col items-center justify-center',
              rightSlot && 'pr-[4.75rem] sm:pr-[5.25rem]',
            )}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {showBack && (
                <Link
                  href={backHref}
                  className="p-2 -ml-1 text-foreground hover:text-spirits-cyan transition-colors touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
            </div>
            {(rightSlot || showLogout) && (
              <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2 pr-0.5">
                {rightSlot}
                {showLogout && <LogoutButton />}
              </div>
            )}
            {logo ? (
              <img 
                src={logo} 
                alt={logoAlt || title || 'Logo'} 
                className="h-10 w-auto sm:h-12 lg:h-16"
              />
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  {icon && <div className="flex-shrink-0">{icon}</div>}
                  {title && <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>}
                </div>
                {description && (
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-1 text-center hidden sm:block">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      {/* Spacer for fixed header - accounts for safe area */}
      <div 
        style={{
          height: 'calc(env(safe-area-inset-top, 0px) + 64px)',
        }}
        className="sm:h-[calc(env(safe-area-inset-top,0px)+80px)] lg:h-[calc(env(safe-area-inset-top,0px)+90px)]"
      />
    </>
  )
}
