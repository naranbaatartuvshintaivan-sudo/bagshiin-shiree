"use client"

import { useState, useTransition } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { cn, formatClassName } from "@/lib/utils"
import {
  createGradeAction,
  deleteGradeAction,
  reorderGradesAction,
} from "@/app/settings/actions"
import type { GradeWithCount } from "@/lib/supabase/types"

type GradeManagerProps = {
  initialGrades: GradeWithCount[]
}

export function GradeManager({ initialGrades }: GradeManagerProps) {
  const [grades, setGrades] = useState(initialGrades)
  const [selectedGrade, setSelectedGrade] = useState("")
  const [labelText, setLabelText] = useState("")
  const [pending, startTransition] = useTransition()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  function handleAdd() {
    const gradeNum = parseInt(selectedGrade, 10)
    if (!gradeNum || gradeNum < 1 || gradeNum > 12) {
      toast.error("Анги сонгоно уу")
      return
    }
    startTransition(async () => {
      try {
        await createGradeAction(gradeNum, labelText.trim() || null)
        setGrades((cur) => [
          ...cur,
          {
            id: crypto.randomUUID(),
            teacher_id: "",
            label: labelText.trim() || null,
            grade: gradeNum,
            color: null,
            created_at: new Date().toISOString(),
            lesson_count: 0,
            last_updated: null,
          },
        ])
        setSelectedGrade("")
        setLabelText("")
        toast.success("Анги нэмэгдлээ")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Алдаа гарлаа.")
      }
    })
  }

  function handleDelete(id: string, hasLessons: boolean) {
    if (hasLessons) {
      toast.error("Энэ ангид хичээл бүртгэгдсэн тул устгах боломжгүй.")
      return
    }
    if (!confirm("Энэ ангийг устгах уу?")) return
    startTransition(async () => {
      try {
        await deleteGradeAction(id)
        setGrades((cur) => cur.filter((g) => g.id !== id))
        toast.success("Устгагдлаа")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Алдаа гарлаа.")
      }
    })
  }

  function onDragStart(id: string) {
    setDragId(id)
  }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    setOverId(id)
  }
  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setOverId(null)
      return
    }
    const fromIdx = grades.findIndex((g) => g.id === dragId)
    const toIdx = grades.findIndex((g) => g.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const next = grades.slice()
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    setGrades(next)
    setDragId(null)
    setOverId(null)
    startTransition(async () => {
      try {
        await reorderGradesAction(next.map((g) => g.id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Алдаа гарлаа.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {grades.map((g) => {
          const hasLessons = g.lesson_count > 0
          return (
            <li
              key={g.id}
              draggable
              onDragStart={() => onDragStart(g.id)}
              onDragOver={(e) => onDragOver(e, g.id)}
              onDrop={() => onDrop(g.id)}
              onDragEnd={() => {
                setDragId(null)
                setOverId(null)
              }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-white p-3 transition-colors",
                overId === g.id ? "border-accent-orange" : "border-primary-soft/50"
              )}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 cursor-grab text-ink/40" />
                <div>
                  <div className="font-medium text-ink">
                    {formatClassName(g.grade, g.label)}
                  </div>
                  <div className="text-xs text-ink/50">
                    {g.lesson_count} хичээл
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(g.id, hasLessons)}
                disabled={hasLessons || pending}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                  hasLessons
                    ? "cursor-not-allowed border-primary-soft/40 text-ink/30"
                    : "border-destructive/30 text-destructive hover:bg-destructive/10"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Устгах
              </button>
            </li>
          )
        })}
      </ul>

      <div className="rounded-xl border border-primary-soft/50 bg-white p-3 space-y-3">
        <Label>Шинэ анги нэмэх</Label>
        <div className="space-y-2">
          <div>
            <Label htmlFor="new_grade_num">Анги</Label>
            <div className="mt-1">
              <Select
                id="new_grade_num"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="" disabled>Анги сонгох</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {n}-р анги
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="new_grade_label">Тэмдэглэгээ</Label>
            <div className="mt-1">
              <Input
                id="new_grade_label"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="А, Б, В... (заавал биш)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !selectedGrade}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-accent-orange px-3 text-sm font-semibold text-white hover:bg-accent-orange/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Нэмэх
        </button>
      </div>
    </div>
  )
}
