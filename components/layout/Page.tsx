import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Page({ className, children, ...props }: PageProps) {
  return (
    <div
      className={cn(
        'bg-[oklch(0.12_0_0)] rounded-lg p-6 sm:p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn('mb-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function PageTitle({ className, children, ...props }: PageTitleProps) {
  return (
    <h2
      className={cn('text-2xl font-bold text-foreground', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageContent({ className, children, ...props }: PageContentProps) {
  return (
    <div
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}
