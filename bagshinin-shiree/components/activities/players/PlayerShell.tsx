"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Pencil, RotateCcw, Trophy } from "lucide-react"

import { saveAttemptAction } from "@/app/activities/actions"
import type { Activity } from "@/lib/supabase/types"

// Хана-цагийг рендер дотроос бус, тусдаа функцээр уншина (цэвэр рендер).
const now = () => Date.now()

type PlayerApi = {
  /** Тоглоомыг дуусгаж оноог бүртгэнэ. */
  finish: (score: number) => void
  round: number
}

type PlayerShellProps = {
  activity: Activity
  total: number
  children: (api: PlayerApi) => ReactNode
}

/**
 * Оноотой тоглоомуудын нийтлэг бүрхүүл — таймер, дуусгах дэлгэц, дахин тоглох.
 */
export function PlayerShell({ activity, total, children }: PlayerShellProps) {
  const [round, setRound] = useState(0)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  // Эхэлсэн хугацааг ref биш, state-д хадгална (рендерийн цэвэр байдлыг хангах).
  const [startedAt, setStartedAt] = useState(() => now())
  const showTimer = !!activity.settings?.timer

  useEffect(() => {
    if (finished) return
    const t = setInterval(
      () => setElapsed(Math.floor((now() - startedAt) / 1000)),
      1000
    )
    return () => clearInterval(t)
  }, [finished, startedAt])

  const finish = useCallback(
    (s: number) => {
      setScore(s)
      setFinished(true)
      void saveAttemptAction({
        activity_id: activity.id,
        score: s,
        total,
        duration_ms: now() - startedAt,
      }).catch(() => {})
    },
    [activity.id, total, startedAt]
  )

  function replay() {
    setRound((r) => r + 1)
    setFinished(false)
    setScore(0)
    setElapsed(0)
    setStartedAt(now())
  }

  if (finished) {
    return (
      <ScoreScreen
        activity={activity}
        score={score}
        total={total}
        showScore={activity.settings?.showScore !== false}
        onReplay={replay}
      />
    )
  }

  return (
    <div className="space-y-4">
      {showTimer && (
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-deep">
            <Clock className="h-4 w-4" />
            {formatTime(elapsed)}
          </span>
        </div>
      )}
      <div key={round}>{children({ finish, round })}</div>
    </div>
  )
}

function ScoreScreen({
  activity,
  score,
  total,
  showScore,
  onReplay,
}: {
  activity: Activity
  score: number
  total: number
  showScore: boolean
  onReplay: () => void
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow/30 text-accent-orange">
        <Trophy className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-primary-deep">Баяр хүргэе!</h2>
      {showScore ? (
        <>
          <p className="text-4xl font-bold text-primary">
            {score}
            <span className="text-xl text-[var(--text-muted)]"> / {total}</span>
          </p>
          <p className="text-sm text-[var(--text-muted)]">{pct}% зөв</p>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Дасгал дууслаа.</p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
        >
          <RotateCcw className="h-4 w-4" />
          Дахин тоглох
        </button>
        <Link
          href={`/activities/${activity.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-primary-deep hover:bg-primary-soft/30 dark:text-primary-soft dark:hover:bg-primary-soft/10"
        >
          <Pencil className="h-4 w-4" />
          Засах
        </Link>
      </div>
    </motion.div>
  )
}

export function PlayerEmpty({ activityId }: { activityId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-12 text-center">
      <p className="text-sm text-[var(--text-muted)]">
        Энэ дасгалд тоглох агуулга алга байна.
      </p>
      <Link
        href={`/activities/${activityId}/edit`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-4 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90"
      >
        <Pencil className="h-4 w-4" />
        Агуулга нэмэх
      </Link>
    </div>
  )
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft/40">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}
