"use client"

import type { ReactNode } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

export function DropZone({
  id,
  children,
  className,
  active,
}: {
  id: string
  children: ReactNode
  className?: string
  active?: "correct" | "wrong" | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors",
        isOver
          ? "border-primary bg-primary-soft/20"
          : "border-[var(--border-soft)]",
        active === "correct" && "border-primary bg-primary/10",
        active === "wrong" && "border-destructive bg-destructive/10",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DraggableChip({
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
      <ChipBody text={text} disabled={disabled} />
    </div>
  )
}

export function ChipBody({
  text,
  dragging,
  disabled,
}: {
  text: string
  dragging?: boolean
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium shadow-sm",
        disabled
          ? "cursor-default bg-primary/60 text-white"
          : "cursor-grab bg-primary text-white active:cursor-grabbing",
        dragging && "shadow-lg ring-2 ring-primary/30"
      )}
    >
      {!disabled && <GripVertical className="h-3.5 w-3.5 opacity-70" />}
      {text}
    </div>
  )
}
