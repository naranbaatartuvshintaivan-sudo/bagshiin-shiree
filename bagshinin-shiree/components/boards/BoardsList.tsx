"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PenTool, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createBoard, deleteBoard, listBoards } from "@/lib/supabase/boards"
import { formatShortDate } from "@/lib/date"
import type { Board } from "@/lib/supabase/types"

export function BoardsList() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[] | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await listBoards()
        if (!cancelled) setBoards(list)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ачаалах үед алдаа.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function handleCreate() {
    startTransition(async () => {
      try {
        const board = await createBoard()
        router.push(`/board/${board.id}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Үүсгэх үед алдаа.")
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Энэ самбарыг устгах уу?")) return
    startTransition(async () => {
      try {
        await deleteBoard(id)
        setBoards((cur) => (cur ?? []).filter((b) => b.id !== id))
        toast.success("Устгагдлаа")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Устгах үед алдаа.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          Зурах, бичих, mindmap үүсгэх — нэг самбар дээр.
        </p>
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-3 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Шинэ самбар
        </button>
      </div>

      {boards === null ? (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--text-muted)]">
          Ачаалж байна...
        </div>
      ) : boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--text-muted)]">
          Одоогоор самбар байхгүй. Дээрх товчоор шинэ самбар үүсгэнэ үү.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <div
              key={b.id}
              className="group relative rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/board/${b.id}`} className="block">
                <div className="flex items-center gap-2 text-primary">
                  <PenTool className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Самбар
                  </span>
                </div>
                <h3 className="mt-2 truncate text-lg font-semibold text-primary-deep">
                  {b.title}
                </h3>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  Шинэчлэгдсэн: {formatShortDate(b.updated_at || b.created_at)}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Устгах"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
