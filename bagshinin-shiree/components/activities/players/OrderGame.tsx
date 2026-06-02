"use client"

import { useMemo, useState } from "react"
import { horizontalListSortingStrategy } from "@dnd-kit/sortable"

import { cn } from "@/lib/utils"
import { SortableItem, SortableList } from "../dnd"

export type OrderRow = {
  id: string
  prompt?: string
  answer: string[]
}

type Token = { id: string; text: string }

function buildTokens(row: OrderRow): Token[] {
  return row.answer.map((text, i) => ({ id: `${row.id}-${i}`, text }))
}

function scramble(tokens: Token[]): Token[] {
  if (tokens.length < 2) return tokens
  const original = tokens.map((t) => t.id).join("|")
  let out = tokens
  let guard = 0
  do {
    const copy = tokens.slice()
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    out = copy
    guard++
  } while (out.map((t) => t.id).join("|") === original && guard < 20)
  return out
}

export function OrderGame({
  rows,
  onFinish,
  variant,
}: {
  rows: OrderRow[]
  onFinish: (score: number) => void
  variant: "words" | "letters"
}) {
  const initial = useMemo(
    () =>
      Object.fromEntries(rows.map((r) => [r.id, scramble(buildTokens(r))])) as Record<
        string,
        Token[]
      >,
    [rows]
  )
  const [order, setOrder] = useState<Record<string, Token[]>>(initial)
  const [checked, setChecked] = useState(false)

  function reorder(rowId: string, ids: string[]) {
    setOrder((prev) => ({
      ...prev,
      [rowId]: ids.map((id) => prev[rowId].find((t) => t.id === id)!).filter(Boolean),
    }))
  }

  function isCorrect(row: OrderRow) {
    const current = order[row.id].map((t) => t.text).join("")
    return current === row.answer.join("")
  }

  function check() {
    const score = rows.reduce((acc, r) => acc + (isCorrect(r) ? 1 : 0), 0)
    setChecked(true)
    window.setTimeout(() => onFinish(score), 600)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row) => {
          const correct = checked && isCorrect(row)
          const wrong = checked && !isCorrect(row)
          return (
            <div
              key={row.id}
              className={cn(
                "rounded-xl border bg-[var(--card-bg)] p-3",
                correct && "border-primary bg-primary/5",
                wrong && "border-destructive bg-destructive/5",
                !checked && "border-[var(--border-soft)]"
              )}
            >
              {row.prompt && (
                <div className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                  {row.prompt}
                </div>
              )}
              <SortableList
                ids={order[row.id].map((t) => t.id)}
                onReorder={(ids) => reorder(row.id, ids)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-1.5">
                  {order[row.id].map((t) => (
                    <SortableItem key={t.id} id={t.id}>
                      {({ handle, isDragging }) => (
                        <div
                          {...handle.attributes}
                          {...handle.listeners}
                          className={cn(
                            "cursor-grab touch-none select-none rounded-lg bg-primary font-semibold text-white shadow-sm active:cursor-grabbing",
                            variant === "letters"
                              ? "px-3 py-2 text-lg"
                              : "px-3 py-2 text-sm",
                            isDragging && "opacity-60 ring-2 ring-primary/30"
                          )}
                        >
                          {t.text}
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableList>
              {checked && wrong && (
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  Зөв хариулт:{" "}
                  <span className="font-semibold text-primary-deep">
                    {row.answer.join(variant === "letters" ? "" : " ")}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={check}
          disabled={checked}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-orange/90 disabled:opacity-50"
        >
          Шалгах
        </button>
      </div>
    </div>
  )
}
