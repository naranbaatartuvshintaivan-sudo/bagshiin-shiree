"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Gift, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import type { Activity, PairItem } from "@/lib/supabase/types"

import { PlayerEmpty } from "./PlayerShell"

export function OpenBoxPlayer({ activity }: { activity: Activity }) {
  const boxes = useMemo(() => {
    const valid = (activity.content.pairs ?? []).filter(
      (p) => p.term.trim() || p.match.trim()
    )
    return shuffle(valid)
  }, [activity])

  const [opened, setOpened] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<PairItem | null>(null)

  if (boxes.length === 0) return <PlayerEmpty activityId={activity.id} />

  function open(box: PairItem) {
    setOpened((prev) => new Set(prev).add(box.id))
    setActive(box)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          Нээсэн: {opened.size} / {boxes.length}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpened(new Set())
            setActive(null)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30 dark:text-primary-soft"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Дахин эхлэх
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {boxes.map((box, i) => {
          const isOpen = opened.has(box.id)
          return (
            <motion.button
              key={box.id}
              type="button"
              onClick={() => open(box)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-2xl border p-2 text-center transition-colors",
                isOpen
                  ? "border-primary bg-primary-soft/40"
                  : "border-[var(--border-soft)] bg-[var(--card-bg)] hover:border-primary hover:bg-primary-soft/15"
              )}
            >
              {isOpen ? (
                <span className="text-sm font-bold text-primary-deep">
                  {box.match || box.term}
                </span>
              ) : (
                <>
                  <Gift className="h-7 w-7 text-primary" />
                  <span className="mt-1 text-lg font-bold text-primary-deep">
                    {i + 1}
                  </span>
                </>
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-bg)] p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--card-bg)] p-8 text-center shadow-xl"
            >
              {active.term.trim() && (
                <div className="text-sm font-medium text-[var(--text-muted)]">
                  {active.term}
                </div>
              )}
              <div className="mt-2 text-3xl font-bold text-primary-deep">
                {active.match || active.term}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
              >
                Хаах
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
