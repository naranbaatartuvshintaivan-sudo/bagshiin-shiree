"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import type { Activity, PairItem } from "@/lib/supabase/types"

import { PlayerEmpty, PlayerShell } from "./PlayerShell"

type Side = "term" | "match"
type Selection = { side: Side; pairId: string }

export function FindMatchPlayer({ activity }: { activity: Activity }) {
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
      {({ finish }) => <FindMatchBoard pairs={pairs} onFinish={finish} />}
    </PlayerShell>
  )
}

function FindMatchBoard({
  pairs,
  onFinish,
}: {
  pairs: PairItem[]
  onFinish: (score: number) => void
}) {
  const terms = useMemo(() => shuffle(pairs), [pairs])
  const matches = useMemo(() => shuffle(pairs), [pairs])

  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Selection | null>(null)
  const [wrong, setWrong] = useState<string | null>(null)

  function pick(side: Side, pairId: string) {
    if (matched.has(pairId)) return
    if (!selected) {
      setSelected({ side, pairId })
      return
    }
    if (selected.side === side) {
      setSelected({ side, pairId })
      return
    }
    // Хоёр өөр баганаас сонгосон — тааруулна.
    if (selected.pairId === pairId) {
      const next = new Set(matched).add(pairId)
      setMatched(next)
      setSelected(null)
      if (next.size === pairs.length) window.setTimeout(() => onFinish(pairs.length), 400)
    } else {
      const key = `${side}-${pairId}`
      setWrong(key)
      window.setTimeout(() => setWrong(null), 500)
      setSelected(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)]">
        Зүүн талаас нэгийг, баруун талаас түүний хослыг дарж тааруулна уу.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Column
          items={terms}
          side="term"
          field="term"
          selected={selected}
          matched={matched}
          wrong={wrong}
          onPick={pick}
        />
        <Column
          items={matches}
          side="match"
          field="match"
          selected={selected}
          matched={matched}
          wrong={wrong}
          onPick={pick}
        />
      </div>
    </div>
  )
}

function Column({
  items,
  side,
  field,
  selected,
  matched,
  wrong,
  onPick,
}: {
  items: PairItem[]
  side: Side
  field: "term" | "match"
  selected: Selection | null
  matched: Set<string>
  wrong: string | null
  onPick: (side: Side, pairId: string) => void
}) {
  return (
    <div className="space-y-2">
      {items.map((p) => {
        const isMatched = matched.has(p.id)
        const isSelected = selected?.side === side && selected.pairId === p.id
        const isWrong = wrong === `${side}-${p.id}`
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onPick(side, p.id)}
            disabled={isMatched}
            animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
              isMatched && "pointer-events-none border-transparent opacity-0",
              !isMatched &&
                isSelected &&
                "border-primary bg-primary text-white",
              !isMatched && isWrong && "border-destructive bg-destructive/10",
              !isMatched &&
                !isSelected &&
                !isWrong &&
                "border-[var(--border-soft)] bg-[var(--card-bg)] text-[var(--text-ink)] hover:border-primary hover:bg-primary-soft/15"
            )}
          >
            {p[field]}
          </motion.button>
        )
      })}
    </div>
  )
}
