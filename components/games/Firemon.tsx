'use client'

import * as React from 'react'
import Image from 'next/image'
import { Heart, Zap, Shield, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MAX_LIVES, type ExtinguisherCard, type FireCard } from './firemon-data'
import { useFiremonBattle } from './use-firemon-battle'

/** Shows the top ~55% of a trading card (art + name band). */
function CardArtCrop({
  image,
  alt,
  className,
  priority,
}: {
  image: { src: string; width: number; height: number }
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl bg-zinc-900', className)}>
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        className="object-cover object-top"
        sizes="(max-width: 480px) 92vw, 320px"
      />
    </div>
  )
}

function LivesRow({ lives, className }: { lives: number; className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`${lives} of ${MAX_LIVES} lives`}
    >
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <Heart
          key={i}
          className={cn(
            'size-5 sm:size-4',
            i < lives ? 'fill-rose-500 text-rose-500' : 'text-zinc-700'
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}

function HpBar({
  current,
  max,
  variant,
  className,
}: {
  current: number
  max: number
  variant: 'player' | 'fire'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  return (
    <div
      className={cn('h-3 flex-1 overflow-hidden rounded-full bg-zinc-800/90', className)}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          variant === 'player' ? 'bg-emerald-500' : 'bg-orange-500'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function BattleStatPanel({
  label,
  name,
  current,
  max,
  variant,
  className,
}: {
  label: string
  name: string
  current: number
  max: number
  variant: 'player' | 'fire'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/12 bg-zinc-950/90 px-3 py-2 shadow-lg backdrop-blur-md',
        className
      )}
    >
      <p
        className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          variant === 'fire' ? 'text-orange-400/90' : 'text-emerald-400/90'
        )}
      >
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-zinc-100">{name}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <HpBar current={current} max={max} variant={variant} />
        <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-400">
          {current}
          <span className="text-zinc-600">/{max}</span>
        </span>
      </div>
    </div>
  )
}

function BattleCard({
  image,
  alt,
  active,
  className,
  children,
}: {
  image: { src: string; width: number; height: number }
  alt: string
  active?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative w-full transition-transform duration-300',
        active && 'scale-[1.04]',
        className
      )}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <div className="absolute inset-0 rounded-xl bg-zinc-900/40 shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/10" />
      <div className="relative h-full w-full">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          sizes="(max-width: 480px) 48vw, 220px"
        />
      </div>
      {children}
    </div>
  )
}

/** Measured horizontal inset so first/last carousel cards can snap to centre. */
function useCarouselEdgePadding(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  cardSelector: string,
  remeasureKey: number
) {
  const [sidePad, setSidePad] = React.useState(0)

  React.useLayoutEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const measure = () => {
      const card = scrollEl.querySelector<HTMLElement>(cardSelector)
      if (!card) return
      setSidePad(Math.max(0, (scrollEl.clientWidth - card.offsetWidth) / 2))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scrollEl)
    const card = scrollEl.querySelector<HTMLElement>(cardSelector)
    if (card) ro.observe(card)
    return () => ro.disconnect()
  }, [scrollRef, cardSelector, remeasureKey])

  return sidePad
}

/** Hand pick: large fire art, scrollable extinguisher cards (visual only). */
function HandSelectView({
  fire,
  extinguishers,
  lives,
  onSelect,
}: {
  fire: FireCard
  extinguishers: ExtinguisherCard[]
  lives: number
  onSelect: (id: ExtinguisherCard['id']) => void
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const sidePad = useCarouselEdgePadding(
    scrollRef,
    '[data-firemon-hand-card]',
    extinguishers.length
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
        <LivesRow lives={lives} />
        <p className="text-xs font-medium text-zinc-500">What will you send out?</p>
      </div>

      <div className="shrink-0 px-4 pb-3">
        <div
          className="relative mx-auto aspect-[5/3.2] w-full max-w-[min(100%,340px)]"
          aria-hidden={false}
        >
          <CardArtCrop
            image={fire.image}
            alt={fire.name}
            className="absolute inset-0 shadow-[0_8px_40px_rgba(251,146,60,0.15)] ring-1 ring-white/10"
            priority
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col border-t border-white/[0.06] bg-zinc-950/50">
        <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
          <p className="text-sm font-medium text-zinc-300">Choose an extinguisher</p>
          <p className="text-[11px] font-medium text-zinc-500">Swipe →</p>
        </div>

        <div
          ref={scrollRef}
          className={cn(
            'w-full min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain',
            'pb-4 pt-1',
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
          )}
        >
          <div className="flex h-full min-h-[min(48dvh,420px)] w-max items-center gap-3">
            <div
              aria-hidden
              className="shrink-0 snap-none"
              style={{ width: sidePad }}
            />
            {extinguishers.map((card) => (
              <button
                key={card.id}
                type="button"
                data-firemon-hand-card
                onClick={() => onSelect(card.id)}
                className={cn(
                  'w-[76vw] max-w-[360px] shrink-0 snap-center touch-manipulation',
                  'active:scale-[0.99]'
                )}
              >
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-zinc-900/40 ring-1 ring-white/15 transition active:ring-2 active:ring-orange-400/50"
                  style={{
                    aspectRatio: `${card.image.width} / ${card.image.height}`,
                  }}
                >
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-contain"
                    sizes="76vw"
                  />
                </div>
              </button>
            ))}
            <div
              aria-hidden
              className="shrink-0 snap-none"
              style={{ width: sidePad }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/** In-battle: Pokemon-style arena — opponent top-right, player bottom-left. */
function BattleView({
  fire,
  ext,
  state,
  isPlayerTurn,
  enemyAttacking,
  chargingAbility,
  onAbility,
}: {
  fire: FireCard
  ext: ExtinguisherCard
  state: ReturnType<typeof useFiremonBattle>['state']
  isPlayerTurn: boolean
  enemyAttacking: boolean
  chargingAbility: { name: string } | null
  onAbility: (id: string) => void
}) {
  const busy = enemyAttacking || !!chargingAbility || state.playerTurnDisabled

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <LivesRow lives={state.lives} />
        <span className="text-xs font-medium text-zinc-500">
          Turn {state.fireTurn === 0 ? 1 : state.fireTurn + (enemyAttacking ? 1 : 0)}
        </span>
      </div>

      <div className="relative min-h-[min(52dvh,380px)] flex-1 overflow-hidden bg-gradient-to-b from-orange-950/25 via-[#0d1018] to-emerald-950/20">
        <BattleStatPanel
          label="Opponent"
          name={fire.name}
          current={state.fireHp}
          max={fire.hp}
          variant="fire"
          className="absolute left-3 top-3 z-20 w-[min(72%,240px)]"
        />
        <div className="absolute right-1 top-10 z-10 w-[min(46vw,210px)] sm:right-3 sm:w-[min(42vw,220px)]">
          <BattleCard image={fire.image} alt={fire.name} active={enemyAttacking} />
        </div>
        <div className="absolute bottom-4 left-1 z-10 w-[min(52vw,240px)] sm:left-3 sm:w-[min(48vw,250px)]">
          <BattleCard
            image={ext.image}
            alt={ext.name}
            active={isPlayerTurn && !chargingAbility}
          >
            {state.shieldTurns > 0 && (
              <div className="absolute -right-1 -top-1 z-10 rounded-full bg-blue-600 p-2 ring-2 ring-zinc-950">
                <Shield className="size-4 text-white" aria-hidden />
              </div>
            )}
            {chargingAbility && (
              <div className="absolute -right-1 -top-1 z-10 rounded-full bg-amber-600 p-2 ring-2 ring-zinc-950">
                <Hourglass className="size-4 text-white" aria-hidden />
              </div>
            )}
          </BattleCard>
        </div>
        <BattleStatPanel
          label="You"
          name={ext.shortName}
          current={state.playerHp}
          max={ext.hp}
          variant="player"
          className="absolute bottom-4 right-3 z-20 w-[min(72%,240px)]"
        />
      </div>

      <div className="shrink-0 space-y-2.5 border-t border-white/[0.06] bg-zinc-950 px-3 py-3">
        <p
          className="min-h-[2.75rem] rounded-lg bg-zinc-900/80 px-3 py-2 text-center text-sm leading-snug text-zinc-200"
          aria-live="polite"
        >
          {state.log[0] ?? '…'}
        </p>

        {isPlayerTurn && !chargingAbility && !state.playerTurnDisabled && (
          <div className="grid grid-cols-2 gap-2">
            {ext.abilities.map((ability) => {
              const livesCost = ability.livesCost ?? 0
              const livesGain = ability.livesGained ?? 0
              const disabled =
                (livesCost > 0 && state.lives <= livesCost) ||
                (livesGain > 0 && state.lives >= MAX_LIVES)
              return (
                <Button
                  key={ability.id}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    'h-14 touch-manipulation rounded-xl text-base font-semibold',
                    'bg-zinc-800 text-zinc-50 hover:bg-zinc-700 active:scale-[0.98]',
                    disabled && 'opacity-40'
                  )}
                  onClick={() => onAbility(ability.id)}
                >
                  {ability.name}
                </Button>
              )
            })}
          </div>
        )}

        {busy && (
          <p className="flex items-center justify-center gap-2 py-2 text-sm text-zinc-400">
            {chargingAbility ? (
              <>
                <Hourglass className="size-4 animate-pulse text-amber-400" aria-hidden />
                Releasing {chargingAbility.name}…
              </>
            ) : state.playerTurnDisabled ? (
              <>
                <Hourglass className="size-4 animate-pulse text-amber-400" aria-hidden />
                Recovering from System Failure…
              </>
            ) : (
              <>
                <Zap className="size-4 animate-pulse text-orange-400" aria-hidden />
                Opponent&apos;s turn…
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )

}

function ResultOverlay({
  phase,
  lives,
  extName,
  onContinue,
  onRestart,
}: {
  phase: 'battle-won' | 'battle-lost' | 'game-over'
  lives: number
  extName?: string
  onContinue: () => void
  onRestart: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-zinc-950/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-5 text-center shadow-2xl">
        {phase === 'battle-won' && (
          <>
            <p className="text-xl font-semibold text-emerald-300">Fire out</p>
            <p className="mt-2 text-sm text-zinc-400">Nice work. Ready for another?</p>
            <Button
              type="button"
              className="mt-5 h-12 w-full touch-manipulation bg-orange-600 text-base hover:bg-orange-500"
              onClick={onContinue}
            >
              Next fire
            </Button>
          </>
        )}
        {phase === 'battle-lost' && (
          <>
            <p className="text-xl font-semibold text-rose-300">
              {extName ? `${extName} fainted` : 'Knocked out'}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Lost a life. Try a different extinguisher?
            </p>
            <Button
              type="button"
              className="mt-5 h-12 w-full touch-manipulation bg-orange-600 text-base hover:bg-orange-500"
              onClick={onContinue}
            >
              Choose again ({lives} {lives === 1 ? 'life' : 'lives'})
            </Button>
          </>
        )}
        {phase === 'game-over' && (
          <>
            <p className="text-xl font-semibold text-rose-300">All lives gone</p>
            <p className="mt-2 text-sm text-zinc-400">Keep practising the matchups.</p>
            <Button
              type="button"
              className="mt-5 h-12 w-full touch-manipulation bg-orange-600 text-base hover:bg-orange-500"
              onClick={onRestart}
            >
              Start over
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function Firemon() {
  const {
    state,
    extinguishers,
    activeExtinguisher,
    activeFire,
    selectExtinguisher,
    usePlayerAbility,
    goToHandSelect,
    restartCampaign,
  } = useFiremonBattle()

  const isPlayerTurn = state.phase === 'player-turn'
  const enemyAttacking = state.phase === 'enemy-turn'
  const ext = activeExtinguisher

  const chargingAbility = React.useMemo(() => {
    if (!state.charging || !ext) return null
    const a = ext.abilities.find((ab) => ab.id === state.charging!.abilityId)
    return a ? { name: a.name } : null
  }, [state.charging, ext])

  const showResult =
    state.phase === 'battle-won' ||
    state.phase === 'battle-lost' ||
    state.phase === 'game-over'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0a0c10]">
      {state.phase === 'hand-select' ? (
        <HandSelectView
          fire={activeFire}
          extinguishers={extinguishers}
          lives={state.lives}
          onSelect={selectExtinguisher}
        />
      ) : ext ? (
        <BattleView
          fire={activeFire}
          ext={ext}
          state={state}
          isPlayerTurn={isPlayerTurn}
          enemyAttacking={enemyAttacking}
          chargingAbility={chargingAbility}
          onAbility={usePlayerAbility}
        />
      ) : null}

      {showResult && (
        <ResultOverlay
          phase={state.phase as 'battle-won' | 'battle-lost' | 'game-over'}
          lives={state.lives}
          extName={ext?.shortName}
          onContinue={goToHandSelect}
          onRestart={restartCampaign}
        />
      )}
    </div>
  )
}
