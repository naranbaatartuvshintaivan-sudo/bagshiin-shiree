"use client"

import type { ReactNode } from "react"
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  type SortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Хулгана, хүрэлт, гар — гурвуулангаар нь дэмжсэн нийтлэг sortable жагсаалт.
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
}

type SortableListProps = {
  ids: string[]
  onReorder: (ids: string[]) => void
  children: ReactNode
  strategy?: SortingStrategy
}

export function SortableList({
  ids,
  onReorder,
  children,
  strategy = verticalListSortingStrategy,
}: SortableListProps) {
  const sensors = useDndSensors()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

type SortableState = ReturnType<typeof useSortable>

export type SortableHandle = {
  attributes: SortableState["attributes"]
  listeners: SortableState["listeners"]
}

type SortableItemRenderProps = {
  handle: SortableHandle
  isDragging: boolean
}

export function SortableItem({
  id,
  children,
}: {
  id: string
  children: (props: SortableItemRenderProps) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.85 : 1,
      }}
    >
      {children({ handle: { attributes, listeners }, isDragging })}
    </div>
  )
}
