"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { useTheme } from "next-themes"

import { getBoard, renameBoard, saveBoardData } from "@/lib/supabase/boards"
import type { Board } from "@/lib/supabase/types"

import "@excalidraw/excalidraw/index.css"

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
)

type Props = { boardId: string }

type SaveState = "idle" | "saving" | "saved"

type ExcalidrawElement = { id: string; isDeleted?: boolean } & Record<string, unknown>
type AppStateLike = Record<string, unknown>

export function BoardEditor({ boardId }: Props) {
  const { resolvedTheme } = useTheme()
  const [board, setBoard] = useState<Board | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [titleDraft, setTitleDraft] = useState("")
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const lastSerialized = useRef<string>("")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const b = await getBoard(boardId)
        if (cancelled) return
        if (!b) {
          setError("Самбар олдсонгүй")
          return
        }
        setBoard(b)
        setTitleDraft(b.title)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ачаалах үед алдаа."
        if (!cancelled) setError(msg)
        toast.error(msg)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [boardId])

  const initialData = useMemo(() => {
    if (!board) return null
    const raw = board.data as
      | { elements?: ExcalidrawElement[]; appState?: AppStateLike }
      | null
    return {
      elements: (raw?.elements ?? []) as never,
      appState: {
        ...(raw?.appState ?? {}),
        collaborators: new Map(),
      } as never,
    }
  }, [board])

  const persist = useDebouncedCallback(
    async (elements: ExcalidrawElement[], appState: AppStateLike) => {
      setSaveState("saving")
      try {
        const sanitizedAppState = { ...appState }
        delete (sanitizedAppState as { collaborators?: unknown }).collaborators
        await saveBoardData(boardId, {
          elements,
          appState: sanitizedAppState,
        })
        setSaveState("saved")
      } catch (err) {
        setSaveState("idle")
        toast.error(err instanceof Error ? err.message : "Хадгалах үед алдаа.")
      }
    },
    2000
  )

  const handleChange = useCallback(
    (
      elements: readonly { id: string; isDeleted?: boolean }[],
      appState: unknown
    ) => {
      const liveElements = elements.filter((e) => !e.isDeleted) as ExcalidrawElement[]
      const serialized = JSON.stringify(liveElements)
      if (serialized === lastSerialized.current) return
      lastSerialized.current = serialized
      persist(liveElements, appState as AppStateLike)
    },
    [persist]
  )

  const persistTitle = useDebouncedCallback(async (next: string) => {
    try {
      await renameBoard(boardId, next)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Гарчиг хадгалах үед алдаа.")
    }
  }, 800)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setTitleDraft(next)
    persistTitle(next)
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Link
          href="/boards"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Link>
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--bg-paper)]">
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border-soft)] bg-[var(--card-bg)] px-3 py-2">
        <Link
          href="/boards"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary-soft/30 dark:hover:bg-primary-soft/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Самбарууд
        </Link>
        <input
          value={titleDraft}
          onChange={handleTitleChange}
          placeholder="Самбарын гарчиг"
          className="min-w-0 flex-1 bg-transparent px-2 py-1 text-base font-semibold text-primary-deep outline-none focus:bg-primary-soft/20 rounded-md"
        />
        <div className="shrink-0 text-xs text-[var(--text-muted)]">
          {saveState === "saving" && "Хадгалж байна..."}
          {saveState === "saved" && "Хадгалагдсан ✓"}
        </div>
      </div>

      <div className="relative flex-1">
        {initialData ? (
          <Excalidraw
            initialData={initialData}
            onChange={handleChange as never}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            langCode="en"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
            Ачаалж байна...
          </div>
        )}
      </div>
    </div>
  )
}
