"use client"

import { GripVertical, Plus, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  emptyListItem,
  emptyPair,
  emptyQuestion,
  emptySentence,
  uid,
} from "@/lib/activities/utils"
import type {
  ListItem,
  PairItem,
  QuizQuestion,
  SentenceItem,
  SortGroup,
} from "@/lib/supabase/types"

import { SortableItem, SortableList, type SortableHandle } from "./dnd"

function DragHandle({ attributes, listeners }: SortableHandle) {
  return (
    <button
      type="button"
      className="flex h-9 w-7 cursor-grab touch-none items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-primary-soft/30 active:cursor-grabbing"
      aria-label="Чирж эрэмбэлэх"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-destructive/10 hover:text-destructive"
      aria-label="Устгах"
    >
      <X className="h-4 w-4" />
    </button>
  )
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary-soft/20"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  )
}

// ── Хос (pairs) ───────────────────────────────────────────────────────────
export type PairLabels = { left: string; right: string }

export function PairsEditor({
  pairs,
  onChange,
  labels,
}: {
  pairs: PairItem[]
  onChange: (next: PairItem[]) => void
  labels: PairLabels
}) {
  function update(id: string, patch: Partial<PairItem>) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  function reorder(ids: string[]) {
    onChange(ids.map((id) => pairs.find((p) => p.id === id)!).filter(Boolean))
  }

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[28px_1fr_1fr_36px] gap-2 px-1 text-xs font-medium text-[var(--text-muted)] sm:grid">
        <span />
        <span>{labels.left}</span>
        <span>{labels.right}</span>
        <span />
      </div>
      <SortableList ids={pairs.map((p) => p.id)} onReorder={reorder}>
        <div className="space-y-2">
          {pairs.map((p) => (
            <SortableItem key={p.id} id={p.id}>
              {({ handle }) => (
                <div className="flex items-start gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-2 sm:items-center">
                  <DragHandle {...handle} />
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      value={p.term}
                      onChange={(e) => update(p.id, { term: e.target.value })}
                      placeholder={labels.left}
                    />
                    <Input
                      value={p.match}
                      onChange={(e) => update(p.id, { match: e.target.value })}
                      placeholder={labels.right}
                    />
                  </div>
                  <RemoveButton
                    onClick={() => onChange(pairs.filter((x) => x.id !== p.id))}
                  />
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <AddButton onClick={() => onChange([...pairs, emptyPair()])}>
        Мөр нэмэх
      </AddButton>
    </div>
  )
}

// ── Энгийн жагсаалт (items) ─────────────────────────────────────────────────
export function ListEditor({
  items,
  onChange,
  label,
}: {
  items: ListItem[]
  onChange: (next: ListItem[]) => void
  label: string
}) {
  function reorder(ids: string[]) {
    onChange(ids.map((id) => items.find((i) => i.id === id)!).filter(Boolean))
  }
  return (
    <div className="space-y-3">
      <SortableList ids={items.map((i) => i.id)} onReorder={reorder}>
        <div className="space-y-2">
          {items.map((it) => (
            <SortableItem key={it.id} id={it.id}>
              {({ handle }) => (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-2">
                  <DragHandle {...handle} />
                  <Input
                    value={it.text}
                    onChange={(e) =>
                      onChange(
                        items.map((x) =>
                          x.id === it.id ? { ...x, text: e.target.value } : x
                        )
                      )
                    }
                    placeholder={label}
                  />
                  <RemoveButton
                    onClick={() => onChange(items.filter((x) => x.id !== it.id))}
                  />
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <AddButton onClick={() => onChange([...items, emptyListItem()])}>
        Зүйл нэмэх
      </AddButton>
    </div>
  )
}

// ── Өгүүлбэр (sentences) ────────────────────────────────────────────────────
export function SentencesEditor({
  sentences,
  onChange,
  label,
  placeholder,
  withBlanks,
}: {
  sentences: SentenceItem[]
  onChange: (next: SentenceItem[]) => void
  label: string
  placeholder: string
  withBlanks: boolean
}) {
  function update(id: string, patch: Partial<SentenceItem>) {
    onChange(sentences.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function reorder(ids: string[]) {
    onChange(
      ids.map((id) => sentences.find((s) => s.id === id)!).filter(Boolean)
    )
  }
  return (
    <div className="space-y-3">
      <SortableList ids={sentences.map((s) => s.id)} onReorder={reorder}>
        <div className="space-y-2">
          {sentences.map((s) => (
            <SortableItem key={s.id} id={s.id}>
              {({ handle }) => (
                <div className="flex items-start gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-2">
                  <DragHandle {...handle} />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={s.text}
                      onChange={(e) => update(s.id, { text: e.target.value })}
                      placeholder={placeholder}
                    />
                    {withBlanks && (
                      <Input
                        value={(s.blanks ?? []).join(", ")}
                        onChange={(e) =>
                          update(s.id, {
                            blanks: e.target.value
                              .split(",")
                              .map((b) => b.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Нөхөх үг(с) — таслалаар тусгаарла"
                        className="text-[13px]"
                      />
                    )}
                  </div>
                  <RemoveButton
                    onClick={() =>
                      onChange(sentences.filter((x) => x.id !== s.id))
                    }
                  />
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <AddButton onClick={() => onChange([...sentences, emptySentence()])}>
        {label} нэмэх
      </AddButton>
    </div>
  )
}

// ── Бүлэг (groups) ──────────────────────────────────────────────────────────
export function GroupsEditor({
  groups,
  onChange,
}: {
  groups: SortGroup[]
  onChange: (next: SortGroup[]) => void
}) {
  function update(id: string, patch: Partial<SortGroup>) {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }
  function reorder(ids: string[]) {
    onChange(ids.map((id) => groups.find((g) => g.id === id)!).filter(Boolean))
  }
  return (
    <div className="space-y-3">
      <SortableList ids={groups.map((g) => g.id)} onReorder={reorder}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <SortableItem key={g.id} id={g.id}>
              {({ handle }) => (
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-3">
                  <div className="flex items-center gap-2">
                    <DragHandle {...handle} />
                    <Input
                      value={g.name}
                      onChange={(e) => update(g.id, { name: e.target.value })}
                      placeholder="Бүлгийн нэр"
                      className="font-semibold"
                    />
                    <RemoveButton
                      onClick={() =>
                        onChange(groups.filter((x) => x.id !== g.id))
                      }
                    />
                  </div>
                  <div className="mt-2 space-y-1.5 pl-9">
                    {g.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const next = g.items.slice()
                            next[idx] = e.target.value
                            update(g.id, { items: next })
                          }}
                          placeholder="Зүйл"
                          className="h-9"
                        />
                        <RemoveButton
                          onClick={() =>
                            update(g.id, {
                              items: g.items.filter((_, i) => i !== idx),
                            })
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => update(g.id, { items: [...g.items, ""] })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Зүйл нэмэх
                    </button>
                  </div>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <AddButton
        onClick={() => onChange([...groups, { id: uid(), name: "", items: [] }])}
      >
        Бүлэг нэмэх
      </AddButton>
    </div>
  )
}

// ── Асуулт (questions) ──────────────────────────────────────────────────────
export function QuestionsEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestion[]
  onChange: (next: QuizQuestion[]) => void
}) {
  function update(id: string, patch: Partial<QuizQuestion>) {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }
  function reorder(ids: string[]) {
    onChange(
      ids.map((id) => questions.find((q) => q.id === id)!).filter(Boolean)
    )
  }
  return (
    <div className="space-y-3">
      <SortableList ids={questions.map((q) => q.id)} onReorder={reorder}>
        <div className="space-y-3">
          {questions.map((q, qi) => (
            <SortableItem key={q.id} id={q.id}>
              {({ handle }) => (
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-3">
                  <div className="flex items-center gap-2">
                    <DragHandle {...handle} />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Асуулт {qi + 1}
                    </span>
                    <div className="flex-1" />
                    <RemoveButton
                      onClick={() =>
                        onChange(questions.filter((x) => x.id !== q.id))
                      }
                    />
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => update(q.id, { question: e.target.value })}
                    placeholder="Асуултын текст"
                    className="mt-2"
                  />
                  <div className="mt-2 space-y-1.5 pl-9">
                    {q.answers.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            update(q.id, {
                              answers: q.answers.map((x) => ({
                                ...x,
                                correct: x.id === a.id,
                              })),
                            })
                          }
                          aria-label={a.correct ? "Зөв хариулт" : "Зөв гэж тэмдэглэх"}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors",
                            a.correct
                              ? "border-primary bg-primary text-white"
                              : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-primary"
                          )}
                        >
                          ✓
                        </button>
                        <Input
                          value={a.text}
                          onChange={(e) =>
                            update(q.id, {
                              answers: q.answers.map((x) =>
                                x.id === a.id
                                  ? { ...x, text: e.target.value }
                                  : x
                              ),
                            })
                          }
                          placeholder="Хариулт"
                          className="h-9"
                        />
                        <RemoveButton
                          onClick={() =>
                            update(q.id, {
                              answers: q.answers.filter((x) => x.id !== a.id),
                            })
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        update(q.id, {
                          answers: [
                            ...q.answers,
                            { id: uid(), text: "", correct: false },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Хариулт нэмэх
                    </button>
                  </div>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <AddButton onClick={() => onChange([...questions, emptyQuestion()])}>
        Асуулт нэмэх
      </AddButton>
    </div>
  )
}
