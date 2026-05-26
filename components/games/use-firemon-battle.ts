'use client'

import * as React from 'react'
import {
  ALL_EXTINGUISHERS,
  ALL_FIRES,
  MAX_LIVES,
  STARTING_LIVES,
  computeAttackDamage,
  effectivenessLine,
  getExtinguisher,
  getFire,
  type ExtinguisherId,
  type FireCard,
  type FireId,
} from './firemon-data'

export type BattlePhase =
  | 'hand-select'
  | 'player-turn'
  | 'enemy-turn'
  | 'battle-won'
  | 'battle-lost'
  | 'game-over'

export interface ChargingAbility {
  abilityId: string
  /** Turns remaining before the ability fires (0 = ready to release on next player-turn) */
  turnsLeft: number
}

export interface FireChargingAbility {
  abilityId: string
  turnsLeft: number
}

export interface FiremonBattleState {
  phase: BattlePhase
  lives: number
  activeId: ExtinguisherId | null
  fireId: FireId
  playerHp: number
  fireHp: number
  /** Number of completed fire turns this battle */
  fireTurn: number
  log: string[]
  charging: ChargingAbility | null
  fireCharging: FireChargingAbility | null
  shieldTurns: number
  /** Extinguisher attack type used by the player's most recent damaging move (null for shield/heal/charge-start) */
  lastPlayerAttackType: string | null
  /** Player cannot use abilities this turn (e.g. System Failure) */
  playerTurnDisabled: boolean
}

const ENEMY_TURN_DELAY_MS = 1100
const RELEASE_DELAY_MS = 950

function pickRandomFire(exclude?: FireId): FireCard {
  const pool = exclude ? ALL_FIRES.filter((f) => f.id !== exclude) : ALL_FIRES
  const list = pool.length > 0 ? pool : ALL_FIRES
  return list[Math.floor(Math.random() * list.length)]
}

function initialState(): FiremonBattleState {
  const fire = pickRandomFire()
  return {
    phase: 'hand-select',
    lives: STARTING_LIVES,
    activeId: null,
    fireId: fire.id,
    playerHp: 0,
    fireHp: fire.hp,
    fireTurn: 0,
    log: [`A ${fire.name} appeared! Pick an extinguisher.`],
    charging: null,
    fireCharging: null,
    shieldTurns: 0,
    lastPlayerAttackType: null,
    playerTurnDisabled: false,
  }
}

function appendLog(log: string[], line: string, max = 12): string[] {
  return [line, ...log].slice(0, max)
}

type FireAttackPlan =
  | {
      kind: 'attack'
      abilityId: string
      name: string
      damage: number
      bonusLine?: string
      disablesPlayerTurn?: boolean
    }
  | { kind: 'start-charge'; abilityId: string; name: string; chargeTurns: number }

/**
 * Per-fire AI. Returns an immediate attack or a charge start for the enemy turn.
 */
function chooseFireAttack(fire: FireCard, state: FiremonBattleState): FireAttackPlan {
  if (fire.id === 'lipo-battery') {
    if (state.fireTurn >= 1) {
      return { kind: 'attack', abilityId: 'explosion', name: 'Explosion', damage: 1000 }
    }
    return { kind: 'attack', abilityId: 'shock', name: 'Shock', damage: 50 }
  }

  if (fire.id === 'deep-fat-fryer') {
    if (state.fireTurn >= 1) {
      const doubled = state.lastPlayerAttackType === 'water'
      return {
        kind: 'attack',
        abilityId: 'flashover',
        name: 'Flashover',
        damage: doubled ? 300 : 150,
        bonusLine: doubled ? 'Doubled — fryer was just hit by water!' : undefined,
      }
    }
    return { kind: 'attack', abilityId: 'grease-flare', name: 'Grease Flare', damage: 70 }
  }

  if (fire.id === 'server-rack-fire') {
    if (state.fireTurn >= 1 && !state.fireCharging) {
      const systemFailure = fire.abilities.find((a) => a.id === 'system-failure')
      return {
        kind: 'start-charge',
        abilityId: 'system-failure',
        name: systemFailure?.name ?? 'System Failure',
        chargeTurns: systemFailure?.chargeTurns ?? 2,
      }
    }
    return { kind: 'attack', abilityId: 'power-surge', name: 'Power Surge', damage: 60 }
  }

  if (fire.id === 'petrol-spill') {
    if (state.fireTurn >= 1) {
      const doubled = state.lastPlayerAttackType === 'water'
      return {
        kind: 'attack',
        abilityId: 'vapour-ignition',
        name: 'Vapour Ignition',
        damage: doubled ? 260 : 130,
        bonusLine: doubled
          ? 'Extra damage — petrol was hit by water last turn!'
          : undefined,
      }
    }
    return { kind: 'attack', abilityId: 'fuel-spread', name: 'Fuel Spread', damage: 50 }
  }

  if (fire.id === 'wooden-pallet') {
    if (state.fireTurn >= 1) {
      return { kind: 'attack', abilityId: 'rapid-spread', name: 'Rapid Spread', damage: 100 }
    }
    return { kind: 'attack', abilityId: 'ember-toss', name: 'Ember Toss', damage: 40 }
  }

  if (fire.id === 'gas-cylinder') {
    if (state.fireTurn >= 1) {
      return { kind: 'attack', abilityId: 'pressure-burst', name: 'Pressure Burst', damage: 160 }
    }
    return { kind: 'attack', abilityId: 'flame-jet', name: 'Flame Jet', damage: 70 }
  }

  const ability = fire.abilities.find((a) => a.damage) ?? fire.abilities[0]
  return {
    kind: 'attack',
    abilityId: ability.id,
    name: ability.name,
    damage: ability.damage ?? 0,
  }
}

export function useFiremonBattle() {
  const [state, setState] = React.useState<FiremonBattleState>(initialState)
  const enemyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const releaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const disabledTurnTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = React.useCallback(() => {
    if (enemyTimerRef.current) clearTimeout(enemyTimerRef.current)
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    if (disabledTurnTimerRef.current) clearTimeout(disabledTurnTimerRef.current)
    enemyTimerRef.current = null
    releaseTimerRef.current = null
    disabledTurnTimerRef.current = null
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  const resolveEnemyTurn = React.useCallback((prev: FiremonBattleState): FiremonBattleState => {
    if (!prev.activeId) return prev
    const ext = getExtinguisher(prev.activeId)
    const fire = getFire(prev.fireId)
    const nextFireTurn = prev.fireTurn + 1

    if (prev.fireCharging && prev.fireCharging.turnsLeft > 0) {
      const ability = fire.abilities.find((a) => a.id === prev.fireCharging!.abilityId)
      const shielded = prev.shieldTurns > 0
      const damage = shielded ? 0 : (ability?.damage ?? 0)
      const nextShield = Math.max(0, prev.shieldTurns - 1)
      const intro = `${fire.name.replace(' Fire', '')} used ${ability?.name ?? 'an attack'}!`
      const disableLine = ability?.disablesPlayerTurn ? ' Your next attack is disabled.' : ''
      const result = shielded
        ? `${intro} Water Shield absorbed it — 0 damage.${disableLine}`
        : `${intro} −${damage} HP.${disableLine}`

      const playerHp = Math.max(0, prev.playerHp - damage)

      if (playerHp <= 0) {
        const livesAfter = prev.lives - 1
        if (livesAfter <= 0) {
          return {
            ...prev,
            phase: 'game-over',
            playerHp: 0,
            shieldTurns: nextShield,
            fireTurn: nextFireTurn,
            charging: null,
            fireCharging: null,
            playerTurnDisabled: false,
            lives: 0,
            log: appendLog(prev.log, `${result} You blacked out — no lives left.`),
          }
        }
        return {
          ...prev,
          phase: 'battle-lost',
          playerHp: 0,
          shieldTurns: 0,
          fireTurn: nextFireTurn,
          charging: null,
          fireCharging: null,
          playerTurnDisabled: false,
          lives: livesAfter,
          log: appendLog(
            prev.log,
            `${result} ${ext.shortName} fainted — ${livesAfter} ${
              livesAfter === 1 ? 'life' : 'lives'
            } left.`
          ),
        }
      }

      return {
        ...prev,
        phase: 'player-turn',
        playerHp,
        shieldTurns: nextShield,
        fireTurn: nextFireTurn,
        fireCharging: null,
        playerTurnDisabled: !!ability?.disablesPlayerTurn,
        log: appendLog(prev.log, result),
      }
    }
    
    const plan = chooseFireAttack(fire, prev)

    if (plan.kind === 'start-charge') {
      return {
        ...prev,
        phase: 'player-turn',
        fireTurn: nextFireTurn,
        fireCharging: {
          abilityId: plan.abilityId,
          turnsLeft: Math.max(1, plan.chargeTurns - 1),
        },
        log: appendLog(
          prev.log,
          `${fire.name.replace(' Fire', '')} started charging ${plan.name}…`
        ),
      }
    }

    const attack = plan
    const shielded = prev.shieldTurns > 0
    const damage = shielded ? 0 : attack.damage
    const nextShield = Math.max(0, prev.shieldTurns - 1)

    const intro = `${fire.name.replace(' Fire', '')} used ${attack.name}!`
    const bonus = attack.bonusLine ? ` ${attack.bonusLine}` : ''
    const result = shielded
      ? `${intro} Water Shield absorbed it — 0 damage.${bonus}`
      : `${intro} −${damage} HP.${bonus}`

    const playerHp = Math.max(0, prev.playerHp - damage)

    if (playerHp <= 0) {
      const livesAfter = prev.lives - 1
      if (livesAfter <= 0) {
        return {
          ...prev,
          phase: 'game-over',
          playerHp: 0,
          shieldTurns: nextShield,
          fireTurn: nextFireTurn,
          charging: null,
          fireCharging: null,
          playerTurnDisabled: false,
          lives: 0,
          log: appendLog(prev.log, `${result} You blacked out — no lives left.`),
        }
      }
      return {
        ...prev,
        phase: 'battle-lost',
        playerHp: 0,
        shieldTurns: 0,
        fireTurn: nextFireTurn,
        charging: null,
        fireCharging: null,
        playerTurnDisabled: false,
        lives: livesAfter,
        log: appendLog(
          prev.log,
          `${result} ${ext.shortName} fainted — ${livesAfter} ${
            livesAfter === 1 ? 'life' : 'lives'
          } left.`
        ),
      }
    }

    return {
      ...prev,
      phase: 'player-turn',
      playerHp,
      shieldTurns: nextShield,
      fireTurn: nextFireTurn,
      fireCharging: null,
      log: appendLog(prev.log, result),
    }
  }, [])

  const scheduleEnemyTurn = React.useCallback(() => {
    if (enemyTimerRef.current) clearTimeout(enemyTimerRef.current)
    enemyTimerRef.current = setTimeout(() => {
      setState((current) => {
        if (current.phase !== 'enemy-turn') return current
        return resolveEnemyTurn(current)
      })
    }, ENEMY_TURN_DELAY_MS)
  }, [resolveEnemyTurn])

  /** Apply an attack ability immediately (damage + win check). */
  const applyAttack = React.useCallback(
    (
      prev: FiremonBattleState,
      abilityName: string,
      baseDamage: number,
      livesCost = 0
    ): FiremonBattleState => {
      if (!prev.activeId) return prev
      const ext = getExtinguisher(prev.activeId)
      const fire = getFire(prev.fireId)
      const { damage, effectiveness } = computeAttackDamage(baseDamage, ext, fire)
      const fireHp = Math.max(0, prev.fireHp - damage)
      const eff = effectivenessLine(effectiveness)
      const hitLine = `${ext.shortName} used ${abilityName}! −${damage} HP${eff ? ` (${eff})` : ''}.`
      const livesAfterCost = Math.max(0, prev.lives - livesCost)
      const costLine = livesCost > 0 ? ` Sacrificed ${livesCost} life.` : ''

      if (livesCost > 0 && livesAfterCost <= 0) {
        return {
          ...prev,
          phase: 'game-over',
          fireHp,
          lives: 0,
          charging: null,
          lastPlayerAttackType: ext.attackType,
          log: appendLog(prev.log, `${hitLine}${costLine} You burnt out.`),
        }
      }

      if (fireHp <= 0) {
        return {
          ...prev,
          phase: 'battle-won',
          fireHp: 0,
          lives: livesAfterCost,
          charging: null,
          lastPlayerAttackType: ext.attackType,
          log: appendLog(prev.log, `${hitLine}${costLine} ${fire.name} extinguished!`),
        }
      }

      return {
        ...prev,
        phase: 'enemy-turn',
        fireHp,
        lives: livesAfterCost,
        charging: null,
        lastPlayerAttackType: ext.attackType,
        log: appendLog(prev.log, `${hitLine}${costLine}`),
      }
    },
    []
  )

  const usePlayerAbility = React.useCallback(
    (abilityId: string) => {
      setState((prev) => {
        if (
          prev.phase !== 'player-turn' ||
          prev.charging ||
          prev.playerTurnDisabled ||
          !prev.activeId
        ) {
          return prev
        }
        const ext = getExtinguisher(prev.activeId)
        const ability = ext.abilities.find((a) => a.id === abilityId)
        if (!ability) return prev

        if (ability.livesGained && ability.livesGained > 0) {
          if (prev.lives >= MAX_LIVES) {
            return {
              ...prev,
              log: appendLog(prev.log, 'Already at max lives.'),
            }
          }
          const lives = Math.min(MAX_LIVES, prev.lives + ability.livesGained)
          const next: FiremonBattleState = {
            ...prev,
            phase: 'enemy-turn',
            lives,
            lastPlayerAttackType: null,
            log: appendLog(
              prev.log,
              `${ext.shortName} used ${ability.name}! +${ability.livesGained} life (${lives}/${MAX_LIVES}).`
            ),
          }
          scheduleEnemyTurn()
          return next
        }

        if (ability.shieldTurns && ability.shieldTurns > 0) {
          const next: FiremonBattleState = {
            ...prev,
            phase: 'enemy-turn',
            shieldTurns: ability.shieldTurns,
            lastPlayerAttackType: null,
            log: appendLog(
              prev.log,
              `${ext.shortName} used ${ability.name}! Damage negated next turn.`
            ),
          }
          scheduleEnemyTurn()
          return next
        }

        const chargeTurns = ability.chargeTurns ?? 1
        if (chargeTurns >= 2) {
          const next: FiremonBattleState = {
            ...prev,
            phase: 'enemy-turn',
            charging: { abilityId, turnsLeft: chargeTurns - 1 },
            lastPlayerAttackType: null,
            log: appendLog(prev.log, `${ext.shortName} started charging ${ability.name}…`),
          }
          scheduleEnemyTurn()
          return next
        }

        if (ability.damage) {
          const next = applyAttack(prev, ability.name, ability.damage, ability.livesCost ?? 0)
          if (next.phase === 'enemy-turn') scheduleEnemyTurn()
          return next
        }

        return prev
      })
    },
    [applyAttack, scheduleEnemyTurn]
  )

  React.useEffect(() => {
    if (state.phase !== 'player-turn' || !state.playerTurnDisabled) return
    if (disabledTurnTimerRef.current) clearTimeout(disabledTurnTimerRef.current)
    disabledTurnTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'player-turn' || !prev.playerTurnDisabled) return prev
        return {
          ...prev,
          phase: 'enemy-turn',
          playerTurnDisabled: false,
          log: appendLog(prev.log, 'System Failure — you cannot attack this turn!'),
        }
      })
      if (enemyTimerRef.current) clearTimeout(enemyTimerRef.current)
      enemyTimerRef.current = setTimeout(() => {
        setState((c) => (c.phase === 'enemy-turn' ? resolveEnemyTurn(c) : c))
      }, ENEMY_TURN_DELAY_MS)
    }, RELEASE_DELAY_MS)
    return () => {
      if (disabledTurnTimerRef.current) clearTimeout(disabledTurnTimerRef.current)
    }
  }, [state.phase, state.playerTurnDisabled, resolveEnemyTurn])

  React.useEffect(() => {
    if (state.phase !== 'player-turn' || !state.charging || !state.activeId) return
    const { abilityId } = state.charging
    const ext = getExtinguisher(state.activeId)
    const ability = ext.abilities.find((a) => a.id === abilityId)
    if (!ability) return

    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    releaseTimerRef.current = setTimeout(() => {
      setState((current) => {
        if (current.phase !== 'player-turn' || !current.charging || !current.activeId) {
          return current
        }
        const next = applyAttack(
          current,
          ability.name,
          ability.damage ?? 0,
          ability.livesCost ?? 0
        )
        if (next.phase === 'enemy-turn') {
          if (enemyTimerRef.current) clearTimeout(enemyTimerRef.current)
          enemyTimerRef.current = setTimeout(() => {
            setState((c) => (c.phase === 'enemy-turn' ? resolveEnemyTurn(c) : c))
          }, ENEMY_TURN_DELAY_MS)
        }
        return next
      })
    }, RELEASE_DELAY_MS)
  }, [state.phase, state.charging, state.activeId, applyAttack, resolveEnemyTurn])

  const selectExtinguisher = React.useCallback((id: ExtinguisherId) => {
    setState((prev) => {
      if (prev.phase !== 'hand-select') return prev
      const ext = getExtinguisher(id)
      const fire = getFire(prev.fireId)
      return {
        ...prev,
        phase: 'player-turn',
        activeId: id,
        playerHp: ext.hp,
        fireHp: fire.hp,
        fireTurn: 0,
        charging: null,
        fireCharging: null,
        shieldTurns: 0,
        lastPlayerAttackType: null,
        playerTurnDisabled: false,
        log: appendLog(prev.log, `${ext.shortName} stepped up to fight ${fire.name}.`),
      }
    })
  }, [])

  const goToHandSelect = React.useCallback(() => {
    clearTimers()
    setState((s) => {
      const fire = pickRandomFire(s.fireId)
      return {
        ...s,
        phase: 'hand-select',
        activeId: null,
        fireId: fire.id,
        playerHp: 0,
        fireHp: fire.hp,
        fireTurn: 0,
        charging: null,
        fireCharging: null,
        shieldTurns: 0,
        lastPlayerAttackType: null,
        playerTurnDisabled: false,
        log: appendLog(s.log, `A ${fire.name} appeared! Pick an extinguisher.`),
      }
    })
  }, [clearTimers])

  const restartCampaign = React.useCallback(() => {
    clearTimers()
    setState(initialState())
  }, [clearTimers])

  const activeExtinguisher = state.activeId ? getExtinguisher(state.activeId) : null
  const activeFire = getFire(state.fireId)

  return {
    state,
    extinguishers: ALL_EXTINGUISHERS,
    activeExtinguisher,
    activeFire,
    selectExtinguisher,
    usePlayerAbility,
    goToHandSelect,
    restartCampaign,
  }
}
