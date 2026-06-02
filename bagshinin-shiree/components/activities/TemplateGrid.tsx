"use client"

import { useState, useTransition } from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { TEMPLATE_LIST, type TemplateMeta } from "@/lib/activities/registry"
import { createActivityAction } from "@/app/activities/actions"

type TemplateGridProps = {
  lessonId?: string
  classId?: string
}

export function TemplateGrid({ lessonId, classId }: TemplateGridProps) {
  const [selected, setSelected] = useState<TemplateMeta | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCreate() {
    if (!selected) return
    const fd = new FormData()
    fd.set("template", selected.template)
    if (lessonId) fd.set("lesson_id", lessonId)
    if (classId) fd.set("class_id", classId)
    startTransition(async () => {
      try {
        await createActivityAction(fd)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Алдаа гарлаа."
        if (msg.includes("NEXT_REDIRECT")) return
        toast.error(msg)
      }
    })
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_LIST.map((t) => {
          const Icon = t.icon
          const active = selected?.template === t.template
          return (
            <button
              key={t.template}
              type="button"
              onClick={() => setSelected(t)}
              aria-pressed={active}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border bg-[var(--card-bg)] p-4 text-left transition-all",
                active
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-[var(--border-soft)] hover:border-primary hover:shadow-md"
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "bg-primary-soft text-primary-deep group-hover:bg-primary group-hover:text-white"
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--text-ink)]">
                  {t.name}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-[var(--text-muted)]">
                  {t.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border-soft)] bg-[var(--card-bg)]/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="min-w-0 text-sm">
            {selected ? (
              <span className="text-[var(--text-ink)]">
                Сонгосон загвар:{" "}
                <span className="font-semibold text-primary-deep">
                  {selected.name}
                </span>
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">
                Загвар сонгоод дэлгэрэнгүйг үзнэ үү.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!selected || pending}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {pending ? "Үүсгэж байна..." : "Энэ загвараар үүсгэх"}
          </button>
        </div>
      </div>
    </div>
  )
}
