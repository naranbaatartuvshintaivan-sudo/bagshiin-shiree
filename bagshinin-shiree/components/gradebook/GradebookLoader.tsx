"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { GradeTable } from "./grade-table"
import { getOrCreateGradebookForClass } from "@/lib/supabase/gradebook"
import type { Gradebook } from "@/lib/supabase/types"

type Props = {
  classId: string
  className: string
}

export function GradebookLoader({ classId, className }: Props) {
  const [gradebook, setGradebook] = useState<Gradebook | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const gb = await getOrCreateGradebookForClass(classId)
        if (!cancelled) setGradebook(gb)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ачаалах үед алдаа."
        if (!cancelled) setError(msg)
        toast.error(msg)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [classId])

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!gradebook) {
    return (
      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--text-muted)]">
        Ачаалж байна...
      </div>
    )
  }

  return <GradeTable gradebook={gradebook} className={className} />
}
