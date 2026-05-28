"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { FileGrid, type DisplayFile } from "@/components/files/FileGrid"
import { cn, formatClassName } from "@/lib/utils"
import { saveLessonAction } from "@/app/lesson/actions"
import { getFilePublicUrl } from "@/lib/supabase/storage"
import type { Grade, LessonFile } from "@/lib/supabase/types"

type LessonFormProps = {
  mode: "new" | "edit"
  grades: Pick<Grade, "id" | "grade" | "label">[]
  initial?: {
    id: string
    class_id: string | null
    title: string
    content: string
    lesson_date: string | null
    files: LessonFile[]
  }
  defaultGradeId?: string
}

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,.ppt,.pptx,image/jpeg,image/png,image/webp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"

export function LessonForm({ mode, grades, initial, defaultGradeId }: LessonFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const [title, setTitle] = useState(initial?.title ?? "")
  const [gradeId, setGradeId] = useState(initial?.class_id ?? defaultGradeId ?? grades[0]?.id ?? "")
  const [lessonDate, setLessonDate] = useState(initial?.lesson_date ?? "")
  const [content, setContent] = useState(initial?.content ?? "")

  const [existing, setExisting] = useState<LessonFile[]>(initial?.files ?? [])
  const [removedExisting, setRemovedExisting] = useState<string[]>([])
  const [staged, setStaged] = useState<File[]>([])

  function addStaged(list: FileList | File[]) {
    const incoming = Array.from(list)
    setStaged((cur) => [...cur, ...incoming])
  }

  function removeStaged(name: string) {
    setStaged((cur) => cur.filter((f) => stagedKey(f) !== name))
  }

  function removeExisting(id: string) {
    setExisting((cur) => cur.filter((f) => f.id !== id))
    setRemovedExisting((cur) => [...cur, id])
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addStaged(e.dataTransfer.files)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Гарчиг оруулна уу.")
      return
    }
    if (!gradeId) {
      toast.error("Анги сонгоно уу.")
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    if (initial?.id) fd.set("id", initial.id)
    fd.set("class_id", gradeId)
    fd.delete("files")
    for (const f of staged) fd.append("files", f)
    fd.delete("deleted_file_ids")
    for (const id of removedExisting) fd.append("deleted_file_ids", id)

    startTransition(async () => {
      try {
        await saveLessonAction(fd)
        toast.success(mode === "new" ? "Хичээл нэмэгдлээ" : "Хадгалагдлаа")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Алдаа гарлаа."
        if (msg.includes("NEXT_REDIRECT")) return
        toast.error(msg)
      }
    })
  }

  const stagedAsDisplay: DisplayFile[] = staged.map((f) => ({
    id: stagedKey(f),
    name: f.name,
    url: undefined,
    type: f.type,
    size: f.size,
  }))
  const existingAsDisplay: DisplayFile[] = existing.map((f) => ({
    id: f.id,
    name: f.file_name,
    url: getFilePublicUrl(f.storage_path),
    type: f.file_type,
    size: null,
  }))

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Хичээлийн гарчиг</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Жишээ: Үгийн сан баяжуулах"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class_id">Анги</Label>
          <Select
            id="class_id"
            name="class_id"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            required
          >
            <option value="" disabled>
              Анги сонгох
            </option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {formatClassName(g.grade, g.label)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lesson_date">Огноо</Label>
          <Input
            id="lesson_date"
            name="lesson_date"
            type="date"
            value={lessonDate ?? ""}
            onChange={(e) => setLessonDate(e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="content">Агуулга</Label>
          <Textarea
            id="content"
            name="content"
            rows={12}
            value={content ?? ""}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault()
                const target = e.currentTarget
                const start = target.selectionStart
                const end = target.selectionEnd
                const next = content.slice(0, start) + "  " + content.slice(end)
                setContent(next)
                requestAnimationFrame(() => {
                  target.selectionStart = target.selectionEnd = start + 2
                })
              }
            }}
            placeholder="Хичээлийн дэлгэрэнгүй (markdown дэмжинэ)"
            className="font-mono text-[13px]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Файл оруулах</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-8 text-center transition-colors",
            dragging
              ? "border-accent-orange bg-accent-orange/5"
              : "border-primary text-ink/70 hover:bg-primary-soft/15"
          )}
        >
          <Upload className="mb-2 h-6 w-6 text-primary" />
          <div className="text-sm font-medium text-primary-deep">
            Файл чирж тавих эсвэл сонгоно уу
          </div>
          <div className="mt-1 text-xs text-ink/50">
            JPG, PNG, WEBP, PDF, PPT, PPTX
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addStaged(e.target.files)
              e.target.value = ""
            }}
          />
        </div>

        {(existing.length > 0 || staged.length > 0) && (
          <div className="space-y-3">
            {existing.length > 0 && (
              <FileGrid
                files={existingAsDisplay}
                onRemove={(id) => removeExisting(id)}
              />
            )}
            {staged.length > 0 && (
              <FileGrid
                files={stagedAsDisplay}
                onRemove={(key) => removeStaged(key)}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent-orange px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-orange/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
        >
          {pending ? "Хадгалж байна..." : "Хадгалах"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-primary-soft px-5 text-sm font-medium text-primary-deep hover:bg-primary-soft/30 sm:w-auto"
        >
          Цуцлах
        </button>
      </div>
    </form>
  )
}

function stagedKey(f: File): string {
  return `${f.name}__${f.size}__${f.lastModified}`
}
