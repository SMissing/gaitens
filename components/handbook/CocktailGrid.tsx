'use client'

import { CocktailCard } from './CocktailCard'

interface Cocktail {
  name: string
  ingredients: string
  method: string
  garnishGlass: string
  isMocktail?: boolean
}

interface CocktailGridProps {
  cocktails: Cocktail[]
}

export function CocktailGrid({ cocktails }: CocktailGridProps) {
  // Separate mocktails from regular cocktails
  const regularCocktails = cocktails.filter(c => !c.isMocktail)
  const mocktails = cocktails.filter(c => c.isMocktail)

  return (
    <div className="space-y-8">
      {/* Regular Cocktails */}
      {regularCocktails.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Cocktails</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {regularCocktails.map((cocktail) => (
              <CocktailCard
                key={cocktail.name}
                name={cocktail.name}
                ingredients={cocktail.ingredients}
                method={cocktail.method}
                garnishGlass={cocktail.garnishGlass}
                isMocktail={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mocktails */}
      {mocktails.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-spirits-yellow">Mocktails</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {mocktails.map((cocktail) => (
              <CocktailCard
                key={cocktail.name}
                name={cocktail.name}
                ingredients={cocktail.ingredients}
                method={cocktail.method}
                garnishGlass={cocktail.garnishGlass}
                isMocktail={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
