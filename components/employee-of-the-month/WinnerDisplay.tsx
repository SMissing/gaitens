'use client'

import { Trophy, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { User } from '@/types/database'

interface WinnerDisplayProps {
  winner: {
    id: string
    userId: string
    month: string
    type: 'staff_pick' | 'manager_pick'
    createdAt: string
    users: User
  }
  type: 'staff_pick' | 'manager_pick'
}

export function WinnerDisplay({ winner, type }: WinnerDisplayProps) {
  const user = winner.users as User
  const isStaffPick = type === 'staff_pick'
  
  // Format month for display (e.g., "2024-01" -> "January 2024")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  return (
    <Card className={`
      relative overflow-hidden
      ${isStaffPick 
        ? 'border-spirits-yellow/50 bg-gradient-to-br from-spirits-yellow/20 via-spirits-yellow/10 to-transparent' 
        : 'border-spirits-cyan/50 bg-gradient-to-br from-spirits-cyan/20 via-spirits-cyan/10 to-transparent'
      }
      shadow-xl
    `}>
      {/* Decorative border */}
      <div className={`
        absolute inset-0 border-2 border-dashed opacity-30
        ${isStaffPick ? 'border-spirits-yellow' : 'border-spirits-cyan'}
      `} />
      
      <CardContent className="p-8 relative z-10">
        <div className="text-center space-y-6">
          {/* Trophy Icon */}
          <div className="flex justify-center">
            <div className={`
              p-6 rounded-full
              ${isStaffPick ? 'bg-spirits-yellow/20' : 'bg-spirits-cyan/20'}
              border-4 ${isStaffPick ? 'border-spirits-yellow' : 'border-spirits-cyan'}
            `}>
              <Trophy className={`
                h-16 w-16
                ${isStaffPick ? 'text-spirits-yellow' : 'text-spirits-cyan'}
              `} />
            </div>
          </div>

          {/* Certificate Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Award className={`
                h-6 w-6
                ${isStaffPick ? 'text-spirits-yellow' : 'text-spirits-cyan'}
              `} />
              <h2 className={`
                text-2xl font-bold uppercase tracking-wider
                ${isStaffPick ? 'text-spirits-yellow' : 'text-spirits-cyan'}
              `}>
                Employee of the Month
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {isStaffPick ? 'Staff Pick' : 'Manager Pick'} • {formatMonth(winner.month)}
            </p>
          </div>

          {/* Winner Name */}
          <div className="py-4 border-y-2 border-border/50">
            <p className="text-4xl md:text-5xl font-bold text-foreground">
              {user.name}
            </p>
            {user.site && (
              <p className="text-lg text-muted-foreground mt-2">
                {user.site}
              </p>
            )}
          </div>

          {/* Certificate Footer */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground italic">
              In recognition of outstanding performance and dedication
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
