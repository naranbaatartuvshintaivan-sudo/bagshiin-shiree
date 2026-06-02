"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import { useDndSensors } from "../dnd"
import type { Activity, PairItem } from "@/lib/supabase/types"

import { PlayerEmpty, PlayerShell } from "./PlayerShell"

export function MatchUpPlayer({ activity }: { activity: Activity }) {
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
      {({ finish }) => <MatchUpRound pairs={pairs} onFinish={finish} />}
    </PlayerShell>
  )
}

function MatchUpRound({
  pairs,
  onFinish,
}: {
  pairs: PairItem[]
  onFinish: (score: number) => void
}) {
  const sensors = useDndSensors()
  const tiles = useMemo(() => shuffle(pairs), [pairs])
  // termId -> tileId
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const placedTileIds = new Set(Object.values(placements))
  const pool = tiles.filter((t) => !placedTileIds.has(t.id))

  function tileById(id: string) {
    return tiles.find((t) => t.id === id)
  }

  function assign(tileId: string, target: string) {
    setPlacements((prev) => {
      const next: Record<string, string> = {}
      for (const [k, v] of Object.entries(prev)) {
        if (v !== tileId) next[k] = v
      }
      if (target !== "pool") next[target] = tileId
      return next
    })
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    assign(String(active.id), String(over.id))
  }

  function check() {
    let score = 0
    for (const p of pairs) {
      if (placements[p.id] === p.id) score++
    }
    setChecked(true)
    window.setTimeout(() => onFinish(score), 600)
  }

  const allPlaced = Object.keys(placements).length === pairs.length

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {pairs.map((p) => {
            const tileId = placements[p.id]
            const tile = tileId ? tileById(tileId) : null
            const correct = checked && tileId === p.id
            const wrong = checked && tileId !== undefined && tileId !== p.id
            return (
              <div
                key={p.id}
                className="flex items-stretch gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-2"
              >
                <div className="flex flex-1 items-center rounded-lg bg-primary-soft/40 px-3 py-2 text-sm font-semibold text-primary-deep">
                  {p.term}
                </div>
                <Slot id={p.id} correct={correct} wrong={wrong}>
                  {tile ? (
                    <Tile id={tile.id} text={tile.match} />
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">
                      Энд чирнэ
                    </span>
                  )}
                </Slot>
              </div>
            )
          })}
        </div>

        <Pool id="pool">
          {pool.length === 0 ? (
            <span className="text-xs text-[var(--text-muted)]">
              Бүх хариултыг байрлууллаа
            </span>
          ) : (
            pool.map((t) => <Tile key={t.id} id={t.id} text={t.match} />)
          )}
        </Pool>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={check}
            disabled={!allPlaced || checked}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90 disabled:opacity-50"
          >
            Шалгах
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <TileBody text={tileById(activeId)?.match ?? ""} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function Slot({
  id,
  children,
  correct,
  wrong,
}: {
  id: string
  children: React.ReactNode
  correct: boolean
  wrong: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[2.75rem] w-40 items-center justify-center rounded-lg border-2 border-dashed px-2 transition-colors",
        isOver ? "border-primary bg-primary-soft/20" : "border-[var(--border-soft)]",
        correct && "border-primary bg-primary/10",
        wrong && "border-destructive bg-destructive/10"
      )}
    >
      {children}
    </div>
  )
}

function Pool({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3 transition-colors",
        isOver ? "border-primary bg-primary-soft/20" : "border-[var(--border-soft)]"
      )}
    >
      {children}
    </div>
  )
}

function Tile({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-30")}
    >
      <TileBody text={text} />
    </div>
  )
}

function TileBody({ text, dragging }: { text: string; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex cursor-grab items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm active:cursor-grabbing",
        dragging && "shadow-lg ring-2 ring-primary/30"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 opacity-70" />
      {text}
    </div>
  )
}
