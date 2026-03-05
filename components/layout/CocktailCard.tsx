'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CocktailCardProps {
  name: string
  ingredients: string
  method: string
  garnishGlass: string
  isMocktail?: boolean
}

export function CocktailCard({ name, ingredients, method, garnishGlass, isMocktail = false }: CocktailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`bg-[oklch(0.12_0_0)] rounded-lg border ${isMocktail ? 'border-spirits-yellow/50' : 'border-border/30'} overflow-hidden transition-all duration-300`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[oklch(0.14_0_0)] transition-colors"
      >
        <h4 className={`font-semibold text-left ${isMocktail ? 'text-spirits-yellow' : 'text-foreground'}`}>
          {isMocktail && <span className="text-xs uppercase mr-2">MOCKTAIL</span>}
          {name}
        </h4>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-2",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      
      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 text-sm border-t border-border/20 pt-3">
          <div>
            <span className="font-medium text-spirits-cyan">Ingredients:</span>
            <p className="text-muted-foreground mt-1">{ingredients}</p>
          </div>
          <div>
            <span className="font-medium text-spirits-cyan">Method:</span>
            <p className="text-muted-foreground mt-1">{method}</p>
          </div>
          <div>
            <span className="font-medium text-spirits-cyan">Garnish/Glass:</span>
            <p className="text-muted-foreground mt-1">{garnishGlass}</p>
          </div>
        </div>
      )}
    </div>
  )
}
