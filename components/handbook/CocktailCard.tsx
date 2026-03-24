'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CocktailCardProps {
  name: string
  ingredients: string
  method: string
  garnishGlass: string
  isMocktail?: boolean
}

// Parse ingredients and extract measurements
function parseIngredient(ingredient: string) {
  const trimmed = ingredient.trim()
  
  // Match patterns like "25ml Vodka", "12.5ml White Rum"
  const mlMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*ml\s+(.+)/i)
  if (mlMatch) {
    return {
      amount: parseFloat(mlMatch[1]),
      unit: 'ml',
      name: mlMatch[2].trim(),
      type: 'spirit'
    }
  }
  
  // Match "Top with Pepsi", "Top half Orange and Cranberry"
  const topMatch = trimmed.match(/^top\s+(?:half\s+)?(?:with\s+)?(.+)/i)
  if (topMatch) {
    return {
      amount: null,
      unit: 'top',
      name: topMatch[1].trim(),
      type: 'topper'
    }
  }
  
  // Match "Fill with Cranberry"
  const fillMatch = trimmed.match(/^fill\s+(?:with\s+)?(.+)/i)
  if (fillMatch) {
    return {
      amount: null,
      unit: 'fill',
      name: fillMatch[1].trim(),
      type: 'topper'
    }
  }
  
  // Match "Dash Grenadine"
  const dashMatch = trimmed.match(/^dash\s+(.+)/i)
  if (dashMatch) {
    return {
      amount: null,
      unit: 'dash',
      name: dashMatch[1].trim(),
      type: 'garnish'
    }
  }
  
  // Match "Drop of Grenadine", "Drop Grenadine"
  const dropMatch = trimmed.match(/^drop\s+(?:of\s+)?(.+)/i)
  if (dropMatch) {
    return {
      amount: null,
      unit: 'drop',
      name: dropMatch[1].trim(),
      type: 'garnish'
    }
  }
  
  // Match "Drizzle Crème de Cassis", "Drizzle Grenadine"
  const drizzleMatch = trimmed.match(/^drizzle\s+(?:a\s+)?(?:small\s+)?(?:amount\s+)?(?:of\s+)?(.+)/i)
  if (drizzleMatch) {
    return {
      amount: null,
      unit: 'drizzle',
      name: drizzleMatch[1].trim(),
      type: 'garnish'
    }
  }
  
  // Match "6-8 Mint leaves", "5 Lime Wedges", "Approx 6 mint leaves"
  const countMatch = trimmed.match(/^(?:approx\s+)?(\d+(?:-\d+)?)\s+(.+)/i)
  if (countMatch && !trimmed.toLowerCase().includes('ml')) {
    return {
      amount: countMatch[1],
      unit: 'count',
      name: countMatch[2].trim(),
      type: 'garnish'
    }
  }
  
  // Match "1 Can Monster Mango"
  const canMatch = trimmed.match(/^(\d+)\s+can\s+(.+)/i)
  if (canMatch) {
    return {
      amount: parseInt(canMatch[1]),
      unit: 'can',
      name: canMatch[2].trim(),
      type: 'other'
    }
  }
  
  // Fallback - just return the whole thing
  return {
    amount: null,
    unit: '',
    name: trimmed,
    type: 'other'
  }
}

function getAmountColor(amount: number | string | null, unit: string): string {
  if (!amount && amount !== 0) {
    if (unit === 'top' || unit === 'fill') return 'text-blue-400'
    if (unit === 'dash' || unit === 'drizzle') return 'text-purple-400'
    if (unit === 'drop') return 'text-pink-400'
    if (unit === 'can') return 'text-cyan-400'
    return 'text-muted-foreground'
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount.split('-')[0]) : amount
  
  if (numAmount <= 12.5) return 'text-green-400'
  if (numAmount <= 25) return 'text-yellow-400'
  if (numAmount <= 37.5) return 'text-orange-400'
  if (numAmount <= 50) return 'text-red-400'
  if (numAmount <= 100) return 'text-pink-400'
  return 'text-purple-400'
}

function getAmountBgColor(amount: number | string | null, unit: string): string {
  if (!amount && amount !== 0) {
    if (unit === 'top' || unit === 'fill') return 'bg-blue-500/20 border-blue-500/30'
    if (unit === 'dash' || unit === 'drizzle') return 'bg-purple-500/20 border-purple-500/30'
    if (unit === 'drop') return 'bg-pink-500/20 border-pink-500/30'
    if (unit === 'can') return 'bg-cyan-500/20 border-cyan-500/30'
    return 'bg-muted/20 border-border'
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount.split('-')[0]) : amount
  
  if (numAmount <= 12.5) return 'bg-green-500/20 border-green-500/30'
  if (numAmount <= 25) return 'bg-yellow-500/20 border-yellow-500/30'
  if (numAmount <= 37.5) return 'bg-orange-500/20 border-orange-500/30'
  if (numAmount <= 50) return 'bg-red-500/20 border-red-500/30'
  if (numAmount <= 100) return 'bg-pink-500/20 border-pink-500/30'
  return 'bg-purple-500/20 border-purple-500/30'
}

export function CocktailCard({ name, ingredients, method, garnishGlass, isMocktail = false }: CocktailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Parse ingredients - split by comma, but handle "Top half X and Y" patterns
  const ingredientList = ingredients
    .split(',')
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0)
    .flatMap(ing => {
      // Handle "Top half Orange and Cranberry" - split into two
      if (ing.toLowerCase().includes('top half') && ing.toLowerCase().includes(' and ')) {
        const parts = ing.split(/ and /i)
        return parts.map((part, idx) => {
          if (idx === 0) {
            return part.trim()
          }
          return `Top with ${part.trim()}`
        })
      }
      return [ing]
    })
    .map(parseIngredient)

  return (
    <>
      {/* Square Card */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "aspect-square rounded-lg border-2 overflow-hidden transition-transform active:scale-95 w-full max-w-full",
          isMocktail 
            ? "bg-gradient-to-br from-spirits-yellow/20 to-spirits-yellow/10 border-spirits-yellow/50" 
            : "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50"
        )}
      >
        <div className="h-full flex flex-col items-center justify-center p-3 text-center">
          {isMocktail && (
            <span className="text-[10px] font-semibold text-spirits-yellow uppercase tracking-wider mb-1">
              Mocktail
            </span>
          )}
          <h3 className={cn(
            "font-bold text-sm leading-tight px-1",
            isMocktail ? "text-spirits-yellow" : "text-foreground"
          )}>
            {name}
          </h3>
        </div>
      </button>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="handbook-font max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isMocktail && (
                <span className="text-xs font-semibold text-spirits-yellow uppercase tracking-wider px-2 py-1 rounded bg-spirits-yellow/20">
                  Mocktail
                </span>
              )}
              {name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-4 sm:p-6 pt-4">
            {/* Ingredients */}
            <div>
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Ingredients
              </h4>
              <div className="space-y-2">
                {ingredientList.map((ing, idx) => {
                  const amountColor = getAmountColor(ing.amount, ing.unit)
                  const bgColor = getAmountBgColor(ing.amount, ing.unit)
                  
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        bgColor
                      )}
                    >
                      {ing.amount !== null && ing.unit === 'ml' && (
                        <span className={cn("font-bold text-lg min-w-[60px]", amountColor)}>
                          {ing.amount}{ing.unit}
                        </span>
                      )}
                      {ing.unit === 'top' && (
                        <span className="text-blue-400 font-semibold text-sm uppercase min-w-[60px]">
                          Top
                        </span>
                      )}
                      {ing.unit === 'fill' && (
                        <span className="text-blue-400 font-semibold text-sm uppercase min-w-[60px]">
                          Fill
                        </span>
                      )}
                      {ing.unit === 'dash' && (
                        <span className="text-purple-400 font-semibold text-sm uppercase min-w-[60px]">
                          Dash
                        </span>
                      )}
                      {ing.unit === 'drizzle' && (
                        <span className="text-purple-400 font-semibold text-sm uppercase min-w-[60px]">
                          Drizzle
                        </span>
                      )}
                      {ing.unit === 'drop' && (
                        <span className="text-pink-400 font-semibold text-sm uppercase min-w-[60px]">
                          Drop
                        </span>
                      )}
                      {ing.unit === 'count' && (
                        <span className="text-cyan-400 font-semibold text-sm min-w-[60px]">
                          {ing.amount}
                        </span>
                      )}
                      {ing.unit === 'can' && (
                        <span className="text-cyan-400 font-semibold text-sm min-w-[60px]">
                          {ing.amount} Can{ing.amount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-foreground flex-1">{ing.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Method */}
            <div>
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Method
              </h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">{method}</p>
              </div>
            </div>

            {/* Garnish & Glass */}
            <div>
              <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Garnish & Glass
              </h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground">{garnishGlass}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
