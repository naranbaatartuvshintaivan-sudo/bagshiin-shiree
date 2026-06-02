import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Gamepad2, Pencil, Plus } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { Badge } from "@/components/ui/badge"
import { LessonContent } from "@/components/lessons/LessonContent"
import { DeleteLessonButton } from "@/components/lessons/DeleteLessonButton"
import { FileGrid } from "@/components/files/FileGrid"
import { formatMongolianDate } from "@/lib/date"
import { formatClassName } from "@/lib/utils"
import { getLessonById } from "@/lib/supabase/queries"
import { getFilePublicUrl } from "@/lib/supabase/storage"
import { getActivitiesByLesson } from "@/lib/supabase/activities"
import { getTemplateMeta } from "@/lib/activities/registry"

export default async function LessonPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [lesson, activities] = await Promise.all([
    getLessonById(id),
    getActivitiesByLesson(id),
  ])
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-deep dark:border-primary-soft/40 px-3 py-1.5 text-xs font-medium text-primary-deep dark:text-primary-soft hover:bg-primary-soft/30 dark:hover:bg-primary-soft/10"
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
            <div className="text-sm text-[var(--text-muted)]">{dateLabel}</div>
          )}

          {typeof lesson.content?.text === "string" && lesson.content.text.trim() && (
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-5">
              <LessonContent content={lesson.content.text} />
            </div>
          )}

          {lesson.files.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
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

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Дасгал / Тоглоом
              </h2>
              <Link
                href={`/activities/new?lesson_id=${lesson.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-primary px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Дасгал нэмэх
              </Link>
            </div>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-6 text-center">
                <Gamepad2 className="h-7 w-7 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Энэ хичээлд дасгал байхгүй байна.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-soft)] rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)]">
                {activities.map((a) => {
                  const meta = getTemplateMeta(a.template)
                  const Icon = meta.icon
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/activities/${a.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-primary-soft/20 dark:hover:bg-primary-soft/10"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[var(--text-ink)]">
                            {a.title}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {meta.name}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </article>
      </div>
    </PageWrapper>
  )
}
