import Link from "next/link"
import { Paperclip, Eye, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/date"
import type { Lesson } from "@/lib/supabase/types"

type LessonCardProps = {
  lesson: Lesson & { file_count: number }
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="rounded-2xl border border-primary-soft/50 bg-white p-5 shadow-sm transition-colors hover:border-primary-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary-deep">{lesson.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink/50">
            <span>{formatShortDate(lesson.lesson_date || lesson.created_at)}</span>
            {lesson.file_count > 0 && (
              <Badge variant="muted">
                <Paperclip className="h-3 w-3" />
                {lesson.file_count}
              </Badge>
            )}
          </div>
          {typeof lesson.content?.text === "string" && lesson.content.text.trim() && (
            <p className="mt-2 line-clamp-2 text-sm text-ink/70">
              {lesson.content.text}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/lesson/${lesson.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          <Eye className="h-3.5 w-3.5" />
          Үзэх
        </Link>
        <Link
          href={`/lesson/${lesson.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-soft px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30"
        >
          <Pencil className="h-3.5 w-3.5" />
          Засах
        </Link>
      </div>
    </div>
  )
}
