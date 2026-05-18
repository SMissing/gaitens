import co2Card from './firemon_assets/extinguishers_cards/--co2.png'
import foamCard from './firemon_assets/extinguishers_cards/--foam.png'
import powderCard from './firemon_assets/extinguishers_cards/--powder.png'
import waterCard from './firemon_assets/extinguishers_cards/--water.png'
import wetChemicalCard from './firemon_assets/extinguishers_cards/--wet-chemical.png'
import lipoCard from './firemon_assets/fire_cards/--lipo-battery.png'
import deepFatFryerCard from './firemon_assets/fire_cards/--deep-fat-fryer.png'
import serverRackFireCard from './firemon_assets/fire_cards/--server-rack-fire.png'
import petrolSpillCard from './firemon_assets/fire_cards/--petrol-spill.png'
import woodenPalletCard from './firemon_assets/fire_cards/--wooden-pallet.png'
import gasCylinderCard from './firemon_assets/fire_cards/--gas-cylinder.png'
import type { StaticImageData } from 'next/image'

export const MAX_LIVES = 3
export const STARTING_LIVES = 3

export type ExtinguisherId = 'co2' | 'foam' | 'powder' | 'water' | 'wet-chemical'
export type FireId =
  | 'lipo-battery'
  | 'deep-fat-fryer'
  | 'server-rack-fire'
  | 'petrol-spill'
  | 'wooden-pallet'
  | 'gas-cylinder'

/**
 * Generic ability schema covering attacks (with optional charge turns) and
 * support effects (heal lives, shield, sacrifice life).
 */
export interface AbilityDefinition {
  id: string
  name: string
  description: string
  /** Base damage before super-effective / resistance multipliers */
  damage?: number
  /** 1 = instant (default); 2 = needs one turn to charge before firing */
  chargeTurns?: number
  /** Restore N lives (capped at MAX_LIVES) */
  livesGained?: number
  /** Sacrifice N lives when the ability resolves */
  livesCost?: number
  /** Negate incoming damage for N fire turns */
  shieldTurns?: number
  /** Fire attack: player skips their next turn (no abilities) */
  disablesPlayerTurn?: boolean
}

export interface ExtinguisherCard {
  id: ExtinguisherId
  name: string
  shortName: string
  hp: number
  image: StaticImageData
  /** Attack type used for fire weakness checks */
  attackType: string
  abilities: AbilityDefinition[]
  /** Tailwind accent for UI highlights */
  accent: {
    border: string
    glow: string
    text: string
    button: string
  }
}

export interface FireCard {
  id: FireId
  name: string
  hp: number
  image: StaticImageData
  /** Extinguisher attack types this fire is weak to (×2 damage) */
  weakTo: string[]
  /** Extinguisher attack types this fire resists (×0.5 damage) */
  resistantTo?: string[]
  abilities: AbilityDefinition[]
}

export const SUPER_EFFECTIVE_MULT = 2
export const RESISTANCE_MULT = 0.5

export const CO2_CARD: ExtinguisherCard = {
  id: 'co2',
  name: 'CO₂ Extinguisher',
  shortName: 'CO₂',
  hp: 200,
  image: co2Card,
  attackType: 'gas',
  accent: {
    border: 'border-cyan-400/40',
    glow: 'shadow-[0_0_24px_rgba(34,211,238,0.35)]',
    text: 'text-cyan-200',
    button: 'border-cyan-400/40 hover:bg-cyan-500/15',
  },
  abilities: [
    {
      id: 'gas',
      name: 'Gas',
      description: 'Spray CO₂ gas at the target.',
      damage: 100,
    },
    {
      id: 'hype-crowd',
      name: 'Hype Crowd',
      description: 'Restore 1 life (max 3).',
      livesGained: 1,
    },
  ],
}

export const FOAM_CARD: ExtinguisherCard = {
  id: 'foam',
  name: 'Foam Extinguisher',
  shortName: 'Foam',
  hp: 200,
  image: foamCard,
  attackType: 'foam',
  accent: {
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    text: 'text-amber-200',
    button: 'border-amber-400/40 hover:bg-amber-500/15',
  },
  abilities: [
    {
      id: 'foam-spray',
      name: 'Foam Spray',
      description: 'Fire a thick layer of foam.',
      damage: 75,
    },
    {
      id: 'encase',
      name: 'Encase',
      description: 'Fully encase your opponent in foam. Charges for 1 turn, then strikes.',
      damage: 400,
      chargeTurns: 2,
    },
  ],
}

export const POWDER_CARD: ExtinguisherCard = {
  id: 'powder',
  name: 'Powder Extinguisher',
  shortName: 'Powder',
  hp: 200,
  image: powderCard,
  attackType: 'powder',
  accent: {
    border: 'border-sky-400/40',
    glow: 'shadow-[0_0_24px_rgba(56,189,248,0.35)]',
    text: 'text-sky-200',
    button: 'border-sky-400/40 hover:bg-sky-500/15',
  },
  abilities: [
    {
      id: 'powder-cloud',
      name: 'Powder Cloud',
      description: 'Release a cloud of powder.',
      damage: 75,
    },
    {
      id: 'overexpose',
      name: 'Overexpose',
      description:
        'Massive damage to everything around you — including yourself. Charges for 1 turn, then costs 1 life on release.',
      damage: 1000,
      chargeTurns: 2,
      livesCost: 1,
    },
  ],
}

export const WATER_CARD: ExtinguisherCard = {
  id: 'water',
  name: 'Water Extinguisher',
  shortName: 'Water',
  hp: 200,
  image: waterCard,
  attackType: 'water',
  accent: {
    border: 'border-blue-400/40',
    glow: 'shadow-[0_0_24px_rgba(96,165,250,0.35)]',
    text: 'text-blue-200',
    button: 'border-blue-400/40 hover:bg-blue-500/15',
  },
  abilities: [
    {
      id: 'water-jet',
      name: 'Water Jet',
      description: 'Blast water at the target.',
      damage: 75,
    },
    {
      id: 'water-shield',
      name: 'Water Shield',
      description: 'Cover yourself in water — negates damage on the next fire turn.',
      shieldTurns: 1,
    },
  ],
}

export const WET_CHEMICAL_CARD: ExtinguisherCard = {
  id: 'wet-chemical',
  name: 'Wet Chemical Extinguisher',
  shortName: 'Wet Chem',
  hp: 200,
  image: wetChemicalCard,
  attackType: 'wet-chemical',
  accent: {
    border: 'border-lime-400/40',
    glow: 'shadow-[0_0_24px_rgba(163,230,53,0.35)]',
    text: 'text-lime-200',
    button: 'border-lime-400/40 hover:bg-lime-500/15',
  },
  abilities: [
    {
      id: 'chem-shot',
      name: 'Chem Shot',
      description: 'Spray a gentle stream of wet chemicals at the target.',
      damage: 200,
    },
    {
      id: 'smother',
      name: 'Smother',
      description:
        'Stomp out the fire so it cannot reignite. Charges for 1 turn, then strikes.',
      damage: 2000,
      chargeTurns: 2,
    },
  ],
}

export const ALL_EXTINGUISHERS: ExtinguisherCard[] = [
  CO2_CARD,
  FOAM_CARD,
  POWDER_CARD,
  WATER_CARD,
  WET_CHEMICAL_CARD,
]

export function getExtinguisher(id: ExtinguisherId): ExtinguisherCard {
  const card = ALL_EXTINGUISHERS.find((e) => e.id === id)
  if (!card) throw new Error(`Unknown extinguisher: ${id}`)
  return card
}

/** Find an extinguisher card by its attack type — used for weakness/resistance chips. */
export function getExtinguisherByAttackType(attackType: string): ExtinguisherCard | undefined {
  return ALL_EXTINGUISHERS.find((e) => e.attackType === attackType)
}

export const LIPO_BATTERY_CARD: FireCard = {
  id: 'lipo-battery',
  name: 'LiPo Battery Fire',
  hp: 200,
  image: lipoCard,
  weakTo: ['gas'],
  abilities: [
    {
      id: 'shock',
      name: 'Shock',
      description: 'Deals 50 damage to your active extinguisher.',
      damage: 50,
    },
    {
      id: 'explosion',
      name: 'Explosion',
      description: 'Deals 1000 damage. Available from the fire’s 2nd turn onward.',
      damage: 1000,
    },
  ],
}

export const DEEP_FAT_FRYER_CARD: FireCard = {
  id: 'deep-fat-fryer',
  name: 'Deep Fat Fryer Fire',
  hp: 180,
  image: deepFatFryerCard,
  weakTo: ['wet-chemical'],
  resistantTo: ['water'],
  abilities: [
    {
      id: 'grease-flare',
      name: 'Grease Flare',
      description: 'Spits burning oil at the opponent.',
      damage: 70,
    },
    {
      id: 'flashover',
      name: 'Flashover',
      description: 'If hit by Water last turn, this attack deals double damage.',
      damage: 150,
    },
  ],
}

export const SERVER_RACK_FIRE_CARD: FireCard = {
  id: 'server-rack-fire',
  name: 'Server Rack Fire',
  hp: 170,
  image: serverRackFireCard,
  weakTo: ['gas'],
  resistantTo: ['water'],
  abilities: [
    {
      id: 'power-surge',
      name: 'Power Surge',
      description: 'Shoots sparks across the room.',
      damage: 60,
    },
    {
      id: 'system-failure',
      name: 'System Failure',
      description: 'Disables opponent’s next attack.',
      damage: 140,
      chargeTurns: 2,
      disablesPlayerTurn: true,
    },
  ],
}

export const PETROL_SPILL_FIRE_CARD: FireCard = {
  id: 'petrol-spill',
  name: 'Petrol Spill Fire',
  hp: 160,
  image: petrolSpillCard,
  weakTo: ['foam'],
  resistantTo: ['gas'],
  abilities: [
    {
      id: 'fuel-spread',
      name: 'Fuel Spread',
      description: 'The fire spreads across the floor.',
      damage: 50,
    },
    {
      id: 'vapour-ignition',
      name: 'Vapour Ignition',
      description: 'Deals extra damage if hit by Water last turn.',
      damage: 130,
    },
  ],
}

export const WOODEN_PALLET_FIRE_CARD: FireCard = {
  id: 'wooden-pallet',
  name: 'Wooden Pallet Fire',
  hp: 140,
  image: woodenPalletCard,
  weakTo: ['water'],
  resistantTo: ['wet-chemical'],
  abilities: [
    {
      id: 'ember-toss',
      name: 'Ember Toss',
      description: 'Throws burning splinters at opponent.',
      damage: 40,
    },
    {
      id: 'rapid-spread',
      name: 'Rapid Spread',
      description: 'Fire spreads across nearby materials.',
      damage: 100,
    },
  ],
}

export const GAS_CYLINDER_FIRE_CARD: FireCard = {
  id: 'gas-cylinder',
  name: 'Gas Cylinder Fire',
  hp: 190,
  image: gasCylinderCard,
  weakTo: ['powder'],
  resistantTo: ['foam'],
  abilities: [
    {
      id: 'flame-jet',
      name: 'Flame Jet',
      description: 'Fires a continuous stream of flames.',
      damage: 70,
    },
    {
      id: 'pressure-burst',
      name: 'Pressure Burst',
      description: 'Massive explosion damage if not extinguished quickly.',
      damage: 160,
    },
  ],
}

export const ALL_FIRES: FireCard[] = [
  LIPO_BATTERY_CARD,
  DEEP_FAT_FRYER_CARD,
  SERVER_RACK_FIRE_CARD,
  PETROL_SPILL_FIRE_CARD,
  WOODEN_PALLET_FIRE_CARD,
  GAS_CYLINDER_FIRE_CARD,
]

export function getFire(id: FireId): FireCard {
  const card = ALL_FIRES.find((f) => f.id === id)
  if (!card) throw new Error(`Unknown fire: ${id}`)
  return card
}

export type AttackEffectiveness = 'super' | 'normal' | 'resist'

/** Apply super-effective (×2), neutral (×1), or resistance (×0.5) multipliers. */
export function computeAttackDamage(
  baseDamage: number,
  extinguisher: ExtinguisherCard,
  fire: FireCard
): { damage: number; effectiveness: AttackEffectiveness } {
  if (fire.weakTo.includes(extinguisher.attackType)) {
    return { damage: baseDamage * SUPER_EFFECTIVE_MULT, effectiveness: 'super' }
  }
  if (fire.resistantTo?.includes(extinguisher.attackType)) {
    return {
      damage: Math.floor(baseDamage * RESISTANCE_MULT),
      effectiveness: 'resist',
    }
  }
  return { damage: baseDamage, effectiveness: 'normal' }
}

export function effectivenessLine(effectiveness: AttackEffectiveness): string {
  if (effectiveness === 'super') return 'Super-effective!'
  if (effectiveness === 'resist') return 'Resisted…'
  return ''
}
