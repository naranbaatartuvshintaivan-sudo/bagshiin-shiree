"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { deleteActivityAction } from "@/app/activities/actions"

type DeleteActivityButtonProps = {
  id: string
  variant?: "icon" | "button"
}

export function DeleteActivityButton({
  id,
  variant = "icon",
}: DeleteActivityButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("Энэ дасгалыг устгах уу?")) return
    startTransition(async () => {
      try {
        await deleteActivityAction(id)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Устгах үед алдаа."
        if (msg.includes("NEXT_REDIRECT")) return
        toast.error(msg)
      }
    })
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Устгах
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className={cn(
        "absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-opacity",
        "hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
      )}
      aria-label="Устгах"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
