import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { Badge } from "@/components/ui/badge"
import { LessonContent } from "@/components/lessons/LessonContent"
import { DeleteLessonButton } from "@/components/lessons/DeleteLessonButton"
import { FileGrid } from "@/components/files/FileGrid"
import { formatMongolianDate } from "@/lib/date"
import { formatClassName } from "@/lib/utils"
import { getLessonById } from "@/lib/supabase/queries"
import { getFilePublicUrl } from "@/lib/supabase/storage"

export default async function LessonPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const lesson = await getLessonById(id)
  if (!lesson) notFound()

  const dateLabel = formatMongolianDate(lesson.lesson_date || lesson.created_at)

  return (
    <PageWrapper title={lesson.title}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={lesson.grade ? `/grade/${lesson.grade.id}` : "/"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/lesson/${lesson.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-deep px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30"
            >
              <Pencil className="h-3.5 w-3.5" />
              Засах
            </Link>
            {lesson.grade && (
              <DeleteLessonButton
                lessonId={lesson.id}
                gradeId={lesson.grade.id}
              />
            )}
          </div>
        </div>

        <article className="mt-5 space-y-4">
          {lesson.grade && (
            <Badge variant="primary">{formatClassName(lesson.grade.grade, lesson.grade.label)}</Badge>
          )}
          <h1 className="text-3xl font-bold text-primary-deep">
            {lesson.title}
          </h1>
          {dateLabel && (
            <div className="text-sm text-ink/60">{dateLabel}</div>
          )}

          {typeof lesson.content?.text === "string" && lesson.content.text.trim() && (
            <div className="rounded-2xl border border-primary-soft/40 bg-white p-5">
              <LessonContent content={lesson.content.text} />
            </div>
          )}

          {lesson.files.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink/60">
                Файлууд
              </h2>
              <FileGrid
                files={lesson.files.map((f) => ({
                  id: f.id,
                  name: f.file_name,
                  url: getFilePublicUrl(f.storage_path),
                  type: f.file_type,
                  size: null,
                }))}
                variant="view"
              />
            </section>
          )}
        </article>
      </div>
    </PageWrapper>
  )
}
