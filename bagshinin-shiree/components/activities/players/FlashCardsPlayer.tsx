"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, RotateCcw, ThumbsUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import type { Activity, PairItem } from "@/lib/supabase/types"

import { PlayerEmpty } from "./PlayerShell"

export function FlashCardsPlayer({ activity }: { activity: Activity }) {
  const cards = useMemo(() => {
    const valid = (activity.content.pairs ?? []).filter(
      (p) => p.term.trim() || p.match.trim()
    )
    return activity.settings?.shuffle ? shuffle(valid) : valid
  }, [activity])

  if (cards.length === 0) return <PlayerEmpty activityId={activity.id} />

  return <FlashDeck cards={cards} />
}

function FlashDeck({ cards }: { cards: PairItem[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())

  const card = cards[index]
  const atEnd = index >= cards.length

  function go(delta: number) {
    setFlipped(false)
    setIndex((i) => Math.min(Math.max(i + delta, 0), cards.length))
  }

  function markKnown() {
    setKnown((prev) => new Set(prev).add(card.id))
    go(1)
  }

  function restart() {
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
  }

  if (atEnd) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center">
        <h2 className="text-2xl font-bold text-primary-deep">Дууслаа!</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Мэдсэн: {known.size} / {cards.length}
        </p>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
        >
          <RotateCcw className="h-4 w-4" />
          Дахин эхлэх
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-[var(--text-muted)]">
        {index + 1} / {cards.length}
      </div>

      <div className="mx-auto w-full max-w-md [perspective:1200px]">
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="relative h-64 w-full [transform-style:preserve-3d]"
          aria-label="Карт эргүүлэх"
        >
          <CardFace className="bg-primary-soft text-primary-deep">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              Урд тал
            </span>
            <span className="mt-2 text-2xl font-bold">{card.term || "—"}</span>
          </CardFace>
          <CardFace
            back
            className="bg-primary text-white [transform:rotateY(180deg)]"
          >
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Ард тал
            </span>
            <span className="mt-2 text-2xl font-bold">{card.match || "—"}</span>
          </CardFace>
        </motion.button>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        Картыг дарж эргүүлнэ үү
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] text-primary-deep hover:bg-primary-soft/30 disabled:opacity-40 dark:text-primary-soft"
          aria-label="Өмнөх"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={markKnown}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
            known.has(card.id)
              ? "bg-primary text-white"
              : "bg-primary-soft text-primary-deep hover:bg-primary hover:text-white"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Мэдсэн
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] text-primary-deep hover:bg-primary-soft/30 dark:text-primary-soft"
          aria-label="Дараах"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function CardFace({
  children,
  className,
  back,
}: {
  children: React.ReactNode
  className?: string
  back?: boolean
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 text-center shadow-sm [backface-visibility:hidden]",
        className
      )}
      aria-hidden={back ? undefined : undefined}
    >
      {children}
    </div>
  )
}
