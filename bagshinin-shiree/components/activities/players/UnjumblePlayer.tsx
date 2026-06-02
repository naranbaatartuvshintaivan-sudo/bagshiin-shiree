"use client"

import { useMemo } from "react"

import type { Activity } from "@/lib/supabase/types"

import { OrderGame, type OrderRow } from "./OrderGame"
import { PlayerEmpty, PlayerShell } from "./PlayerShell"

export function UnjumblePlayer({ activity }: { activity: Activity }) {
  const rows = useMemo<OrderRow[]>(
    () =>
      (activity.content.sentences ?? [])
        .map((s) => ({
          id: s.id,
          answer: s.text.trim().split(/\s+/).filter(Boolean),
        }))
        .filter((r) => r.answer.length >= 2),
    [activity]
  )

  if (rows.length === 0) return <PlayerEmpty activityId={activity.id} />

  return (
    <PlayerShell activity={activity} total={rows.length}>
      {({ finish }) => (
        <OrderGame rows={rows} onFinish={finish} variant="words" />
      )}
    </PlayerShell>
  )
}
