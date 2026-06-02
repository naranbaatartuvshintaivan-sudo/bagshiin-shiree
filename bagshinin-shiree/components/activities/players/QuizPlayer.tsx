"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import type { Activity, QuizQuestion } from "@/lib/supabase/types"

import { PlayerEmpty, PlayerShell, ProgressBar } from "./PlayerShell"

export function QuizPlayer({ activity }: { activity: Activity }) {
  const questions = useMemo(() => {
    const valid = (activity.content.questions ?? []).filter(
      (q) =>
        q.question.trim() &&
        q.answers.some((a) => a.correct) &&
        q.answers.filter((a) => a.text.trim()).length >= 2
    )
    return activity.settings?.shuffle ? shuffle(valid) : valid
  }, [activity])

  if (questions.length === 0) return <PlayerEmpty activityId={activity.id} />

  return (
    <PlayerShell activity={activity} total={questions.length}>
      {({ finish }) => <QuizRound questions={questions} onFinish={finish} />}
    </PlayerShell>
  )
}

function QuizRound({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[]
  onFinish: (score: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const q = questions[index]
  const answers = useMemo(() => shuffle(q.answers), [q])
  const answered = picked !== null

  function pick(id: string, correct: boolean) {
    if (answered) return
    setPicked(id)
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(score)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          Асуулт {index + 1} / {questions.length}
        </span>
        <span className="font-semibold text-primary">Оноо: {score}</span>
      </div>
      <ProgressBar value={index} max={questions.length} />

      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-5"
      >
        <h3 className="text-lg font-semibold text-[var(--text-ink)]">
          {q.question}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {answers.map((a) => {
            const isPicked = picked === a.id
            const reveal = answered && a.correct
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => pick(a.id, a.correct)}
                disabled={answered}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  !answered &&
                    "border-[var(--border-soft)] hover:border-primary hover:bg-primary-soft/15",
                  reveal && "border-primary bg-primary/10 text-primary-deep",
                  answered &&
                    isPicked &&
                    !a.correct &&
                    "border-destructive bg-destructive/10 text-destructive",
                  answered &&
                    !isPicked &&
                    !a.correct &&
                    "border-[var(--border-soft)] opacity-60"
                )}
              >
                <span>{a.text}</span>
                {reveal && <Check className="h-4 w-4 text-primary" />}
                {answered && isPicked && !a.correct && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {answered && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90"
          >
            {index + 1 >= questions.length ? "Дуусгах" : "Дараах"}
          </button>
        </div>
      )}
    </div>
  )
}
