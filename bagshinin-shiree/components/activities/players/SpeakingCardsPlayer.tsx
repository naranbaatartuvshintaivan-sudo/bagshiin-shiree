"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RotateCcw, Shuffle } from "lucide-react"

import { shuffle } from "@/lib/activities/utils"
import type { Activity, ListItem } from "@/lib/supabase/types"

import { PlayerEmpty } from "./PlayerShell"

export function SpeakingCardsPlayer({ activity }: { activity: Activity }) {
  const items = useMemo(
    () => (activity.content.items ?? []).filter((i) => i.text.trim()),
    [activity]
  )

  if (items.length === 0) return <PlayerEmpty activityId={activity.id} />

  return <SpeakingDeck items={items} />
}

function SpeakingDeck({ items }: { items: ListItem[] }) {
  const [deck, setDeck] = useState<ListItem[]>(() => shuffle(items))
  const [index, setIndex] = useState(0)

  const current = deck[index]
  const remaining = deck.length - index - 1
  const done = index >= deck.length

  function reshuffle() {
    setDeck(shuffle(items))
    setIndex(0)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center">
        <h2 className="text-2xl font-bold text-primary-deep">Бүх карт дууслаа</h2>
        <button
          type="button"
          onClick={reshuffle}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
        >
          <Shuffle className="h-4 w-4" />
          Дахин холих
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          Карт {index + 1} / {deck.length}
        </span>
        <span>Үлдсэн: {remaining}</span>
      </div>

      <div className="mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, rotateZ: -4, y: 16 }}
            animate={{ opacity: 1, rotateZ: 0, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-56 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-primary-soft p-8 text-center"
          >
            <span className="text-2xl font-bold text-primary-deep">
              {current.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
        >
          {remaining > 0 ? "Дараагийн карт" : "Дуусгах"}
        </button>
        <button
          type="button"
          onClick={reshuffle}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-primary-deep hover:bg-primary-soft/30 dark:text-primary-soft"
        >
          <RotateCcw className="h-4 w-4" />
          Дахин холих
        </button>
      </div>
    </div>
  )
}
