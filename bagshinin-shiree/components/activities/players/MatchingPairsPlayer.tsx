"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import type { Activity, PairItem } from "@/lib/supabase/types"

import { PlayerEmpty, PlayerShell } from "./PlayerShell"

type Card = { cardId: string; pairId: string; text: string }

export function MatchingPairsPlayer({ activity }: { activity: Activity }) {
  const pairs = useMemo(
    () =>
      (activity.content.pairs ?? []).filter(
        (p) => p.term.trim() && p.match.trim()
      ),
    [activity]
  )

  if (pairs.length === 0) return <PlayerEmpty activityId={activity.id} />

  return (
    <PlayerShell activity={activity} total={pairs.length}>
      {({ finish }) => <MemoryBoard pairs={pairs} onFinish={finish} />}
    </PlayerShell>
  )
}

function MemoryBoard({
  pairs,
  onFinish,
}: {
  pairs: PairItem[]
  onFinish: (score: number) => void
}) {
  const cards = useMemo<Card[]>(() => {
    const list = pairs.flatMap((p) => [
      { cardId: `${p.id}-t`, pairId: p.id, text: p.term },
      { cardId: `${p.id}-m`, pairId: p.id, text: p.match },
    ])
    return shuffle(list)
  }, [pairs])

  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)
  const total = pairs.length

  function click(card: Card) {
    if (matched.has(card.pairId)) return
    if (flipped.includes(card.cardId) || flipped.length === 2) return

    const next = [...flipped, card.cardId]
    setFlipped(next)
    if (next.length < 2) return

    setMoves((m) => m + 1)
    const ca = cards.find((c) => c.cardId === next[0])!
    const cb = cards.find((c) => c.cardId === next[1])!
    if (ca.pairId === cb.pairId) {
      const willComplete = matched.size + 1 === total
      window.setTimeout(() => {
        setMatched((prev) => new Set(prev).add(ca.pairId))
        setFlipped([])
        if (willComplete) window.setTimeout(() => onFinish(total), 400)
      }, 350)
    } else {
      window.setTimeout(() => setFlipped([]), 850)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          Олдсон: {matched.size} / {total}
        </span>
        <span>Оролдлого: {moves}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {cards.map((card) => {
          const isUp = flipped.includes(card.cardId) || matched.has(card.pairId)
          const isMatched = matched.has(card.pairId)
          return (
            <motion.button
              key={card.cardId}
              type="button"
              onClick={() => click(card)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex aspect-[3/4] items-center justify-center rounded-xl border p-2 text-center text-sm font-semibold transition-colors",
                isMatched
                  ? "border-primary bg-primary/10 text-primary-deep"
                  : isUp
                    ? "border-primary bg-primary text-white"
                    : "border-[var(--border-soft)] bg-primary-deep text-primary-deep hover:bg-primary-deep/90"
              )}
            >
              {isUp ? (
                <span>{card.text}</span>
              ) : (
                <span className="text-2xl text-white/80">?</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
