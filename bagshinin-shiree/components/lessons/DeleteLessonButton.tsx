"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteLessonAction } from "@/app/lesson/actions"

type DeleteLessonButtonProps = {
  lessonId: string
  gradeId: string
}

export function DeleteLessonButton({ lessonId, gradeId }: DeleteLessonButtonProps) {
  const [pending, startTransition] = useTransition()

  function onClick() {
    if (!confirm("Энэ хичээлийг устгах уу?")) return
    startTransition(async () => {
      try {
        await deleteLessonAction(lessonId, gradeId)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Алдаа гарлаа."
        if (msg.includes("NEXT_REDIRECT")) return
        toast.error(msg)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Устгах
    </button>
  )
}
