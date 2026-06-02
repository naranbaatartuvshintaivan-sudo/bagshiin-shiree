"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  closestCorners,
  useDraggable,
} from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/activities/utils"
import { useDndSensors } from "../dnd"
import type { Activity, SortGroup } from "@/lib/supabase/types"

import { ChipBody, DropZone } from "./DragBits"
import { PlayerEmpty, PlayerShell } from "./PlayerShell"

type SortItem = { id: string; text: string; correctGroup: string }

export function GroupSortPlayer({ activity }: { activity: Activity }) {
  const groups = useMemo(
    () =>
      (activity.content.groups ?? []).filter((g) => g.name.trim()),
    [activity]
  )
  const items = useMemo<SortItem[]>(
    () =>
      groups.flatMap((g) =>
        g.items
          .filter((t) => t.trim())
          .map((text, i) => ({ id: `${g.id}-${i}`, text, correctGroup: g.id }))
      ),
    [groups]
  )

  if (groups.length < 2 || items.length === 0)
    return <PlayerEmpty activityId={activity.id} />

  return (
    <PlayerShell activity={activity} total={items.length}>
      {({ finish }) => (
        <GroupSortRound groups={groups} items={items} onFinish={finish} />
      )}
    </PlayerShell>
  )
}

function GroupSortRound({
  groups,
  items,
  onFinish,
}: {
  groups: SortGroup[]
  items: SortItem[]
  onFinish: (score: number) => void
}) {
  const sensors = useDndSensors()
  const shuffled = useMemo(() => shuffle(items), [items])
  // itemId -> groupId | "pool"
  const [placement, setPlacement] = useState<Record<string, string>>(() =>
    Object.fromEntries(shuffled.map((it) => [it.id, "pool"]))
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const groupList = groups ?? []

  function itemsIn(zone: string) {
    return shuffled.filter((it) => placement[it.id] === zone)
  }
  function itemById(id: string) {
    return shuffled.find((it) => it.id === id)
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    setPlacement((prev) => ({ ...prev, [String(active.id)]: String(over.id) }))
  }

  function check() {
    let score = 0
    for (const it of shuffled) {
      if (placement[it.id] === it.correctGroup) score++
    }
    setChecked(true)
    window.setTimeout(() => onFinish(score), 600)
  }

  const allPlaced = shuffled.every((it) => placement[it.id] !== "pool")

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-4">
        <DropZone id="pool" className="min-h-[3.5rem] p-3">
          <div className="flex flex-wrap items-center gap-2">
            {itemsIn("pool").length === 0 ? (
              <span className="text-xs text-[var(--text-muted)]">
                Бүх зүйлийг бүлэгт хуваариаллаа
              </span>
            ) : (
              itemsIn("pool").map((it) => (
                <Chip key={it.id} id={it.id} text={it.text} />
              ))
            )}
          </div>
        </DropZone>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groupList.map((g) => (
            <DropZone key={g.id} id={g.id} className="p-3">
              <div className="mb-2 text-sm font-semibold text-primary-deep">
                {g.name}
              </div>
              <div className="flex min-h-[2.5rem] flex-wrap gap-2">
                {itemsIn(g.id).map((it) => {
                  const correct = checked && it.correctGroup === g.id
                  const wrong = checked && it.correctGroup !== g.id
                  return (
                    <div
                      key={it.id}
                      className={cn(
                        "rounded-lg",
                        correct && "ring-2 ring-primary",
                        wrong && "ring-2 ring-destructive"
                      )}
                    >
                      <Chip id={it.id} text={it.text} disabled={checked} />
                    </div>
                  )
                })}
              </div>
            </DropZone>
          ))}
        </div>

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
        {activeId ? <ChipBody text={itemById(activeId)?.text ?? ""} dragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function Chip({
  id,
  text,
  disabled,
}: {
  id: string
  text: string
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-30")}
    >
      <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm">
        {!disabled && <GripVertical className="h-3.5 w-3.5 opacity-70" />}
        {text}
      </span>
    </div>
  )
}
