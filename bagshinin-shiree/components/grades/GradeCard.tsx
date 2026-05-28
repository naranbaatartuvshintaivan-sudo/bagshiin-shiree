import Link from "next/link"
import { BookOpen, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/date"
import { formatClassName } from "@/lib/utils"
import type { GradeWithCount } from "@/lib/supabase/types"

type GradeCardProps = {
  grade: GradeWithCount
}

export function GradeCard({ grade }: GradeCardProps) {
  return (
    <Link
      href={`/grade/${grade.id}`}
      className="group block rounded-2xl border-l-4 border-l-primary bg-white p-5 shadow-sm transition-all hover:border-l-accent-orange hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-primary-deep">
            {formatClassName(grade.grade, grade.label)}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-ink/60">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {grade.lesson_count} хичээл
            </span>
            {grade.last_updated && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatShortDate(grade.last_updated)}
              </span>
            )}
          </div>
        </div>
        <Badge variant="soft">{grade.lesson_count}</Badge>
      </div>
    </Link>
  )
}
