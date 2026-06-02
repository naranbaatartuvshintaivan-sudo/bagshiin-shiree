"use client"

import { useMemo } from "react"

import type { Activity } from "@/lib/supabase/types"

import { OrderGame, type OrderRow } from "./OrderGame"
import { PlayerEmpty, PlayerShell } from "./PlayerShell"

export function AnagramPlayer({ activity }: { activity: Activity }) {
  const rows = useMemo<OrderRow[]>(
    () =>
      (activity.content.sentences ?? [])
        .map((s) => {
          const word = s.text.trim().split(/\s+/)[0] ?? ""
          return {
            id: s.id,
            prompt: s.blanks?.[0]?.trim() || undefined,
            answer: word.split(""),
          }
        })
        .filter((r) => r.answer.length >= 2),
    [activity]
  )

  if (rows.length === 0) return <PlayerEmpty activityId={activity.id} />

  return (
    <PlayerShell activity={activity} total={rows.length}>
      {({ finish }) => (
        <OrderGame rows={rows} onFinish={finish} variant="letters" />
      )}
    </PlayerShell>
  )
}
