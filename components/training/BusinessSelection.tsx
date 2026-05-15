'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import mattPhoto from '@/assets/pngs/matt_photo.png'

interface Business {
  name: string
  site: string
  logo?: string
}

const businesses: Business[] = [
  {
    name: 'Garrison',
    site: 'Garrison',
    logo: '/logos/garrison-logo-white.png',
  },
  {
    name: 'Spirits Bar & Games',
    site: 'Spirits',
    logo: '/logos/spirits-logo.png',
  },
  {
    name: 'Bassment',
    site: 'Bassment',
    logo: '/logos/bassment-logo.png',
  },
]

interface BusinessSelectionProps {
  onSelect: (site: string) => void
}

export function BusinessSelection({ onSelect }: BusinessSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <Card
          key={business.site}
          className="cursor-pointer active:bg-accent/50 active:scale-95 sm:hover:bg-accent/50 transition-all sm:hover:scale-105 sm:hover:shadow-lg touch-manipulation"
          onClick={() => onSelect(business.site)}
        >
          <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px] overflow-hidden">
            {business.logo ? (
              <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden">
                {business.site === 'Bassment' && (
                  <img
                    src={mattPhoto.src}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 m-auto max-w-[90%] max-h-full w-auto h-auto object-contain opacity-[0.1] pointer-events-none z-0"
                  />
                )}
                <img
                  src={business.logo}
                  alt={`${business.name} logo`}
                  className="relative z-10 max-w-[90%] max-h-full w-auto h-auto object-contain"
                />
              </div>
            ) : (
              <>
                <div className="w-full h-24 sm:h-32 mb-4 flex items-center justify-center bg-muted rounded-lg">
                  <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center">{business.name}</h3>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
