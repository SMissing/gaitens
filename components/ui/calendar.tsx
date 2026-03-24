'use client'

import 'react-day-picker/style.css'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  /** Default avoids caption painting over the nav buttons (DayPicker v9 default `navLayout`). */
  navLayout = 'after',
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout={navLayout}
      className={cn('p-0', className)}
      classNames={{
        ...classNames,
        root: cn(
          'w-full',
          /* Override RDP fixed px widths so columns stay equal at full table width (avoids one weekday column stealing slack). */
          '[--rdp-day-width:14.285714%] [--rdp-day-height:auto] [--rdp-day_button-width:100%] [--rdp-day_button-height:auto] [--rdp-day_button-border-radius:1rem]',
          classNames?.root
        ),
        months: cn('relative flex w-full flex-col gap-4 sm:flex-row', classNames?.months),
        month: cn('relative w-full space-y-3', classNames?.month),
        month_caption: cn(
          'relative flex h-11 items-center justify-center px-11 sm:px-12',
          classNames?.month_caption
        ),
        caption_label: cn(
          'text-base font-semibold tracking-tight text-foreground sm:text-lg',
          classNames?.caption_label
        ),
        nav: cn(
          'absolute inset-x-0 top-0 z-10 flex w-full items-center justify-between px-0.5',
          classNames?.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 shrink-0 rounded-xl p-0 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground',
          classNames?.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 shrink-0 rounded-xl p-0 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground',
          classNames?.button_next
        ),
        weekdays: cn('w-full', classNames?.weekdays),
        weekday: cn(
          'border-b border-border/40 pb-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground/75 sm:pb-3.5 sm:text-[0.7rem]',
          classNames?.weekday
        ),
        weeks: cn(
          'w-full pt-2.5 sm:pt-3.5',
          /* tbody: space below weekday header so day cells sit lower under each label */
          classNames?.weeks
        ),
        week: cn(classNames?.week),
        day: cn(
          'group/day relative w-full min-h-0 p-0 text-center align-top text-sm focus-within:z-10',
          classNames?.day
        ),
        day_button: cn(
          'inline-flex h-full min-h-[3.75rem] w-full max-w-full flex-col items-center justify-start gap-0.5 rounded-2xl border border-border/45 bg-white/[0.02] p-2 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-150',
          'sm:min-h-[4.5rem]',
          'hover:border-border/55 hover:bg-white/[0.05]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirits-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-35',
          'aria-selected:opacity-100',
          classNames?.day_button
        ),
        selected: cn('rounded-2xl', classNames?.selected),
        today: cn(
          '[&_button]:ring-1 [&_button]:ring-spirits-cyan/70 [&_button]:ring-offset-1 [&_button]:ring-offset-background',
          classNames?.today
        ),
        outside: cn('text-muted-foreground/60', classNames?.outside),
        disabled: cn('text-muted-foreground', classNames?.disabled),
        hidden: cn('invisible', classNames?.hidden),
        range_start: cn('rounded-s-2xl', classNames?.range_start),
        range_middle: cn('rounded-none', classNames?.range_middle),
        range_end: cn('rounded-e-2xl', classNames?.range_end),
        month_grid: cn(
          'w-full border-separate border-spacing-x-1 border-spacing-y-2 table-fixed sm:border-spacing-x-1.5 sm:border-spacing-y-2.5',
          '[&_th.rdp-weekday]:w-[14.285714%] [&_th.rdp-weekday]:min-w-0',
          '[&_td.rdp-day]:w-[14.285714%] [&_td.rdp-day]:min-w-0',
          classNames?.month_grid
        ),
      }}
      components={{
        Chevron: ({ orientation, className: iconClass, ...iconProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className={cn('h-4 w-4', iconClass)} {...iconProps} />
        },
        ...components,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
