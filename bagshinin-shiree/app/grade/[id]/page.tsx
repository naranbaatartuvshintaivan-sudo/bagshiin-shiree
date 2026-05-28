import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { LessonCard } from "@/components/lessons/LessonCard"
import { Badge } from "@/components/ui/badge"
import { formatClassName } from "@/lib/utils"
import { getGradeById, getLessonsByGrade } from "@/lib/supabase/queries"

export default async function GradePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [grade, lessons] = await Promise.all([
    getGradeById(id),
    getLessonsByGrade(id),
  ])

  if (!grade) notFound()

  return (
    <PageWrapper title={formatClassName(grade.grade, grade.label)}>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Link>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-deep">
              {formatClassName(grade.grade, grade.label)}
            </h1>
            <Badge>{lessons.length} хичээл</Badge>
          </div>
          <Link
            href={`/lesson/new?grade=${grade.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-3 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Шинэ хичээл</span>
          </Link>
        </div>

        <div className="mt-6">
          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary-soft bg-white p-10 text-center">
              <p className="text-sm text-ink/60">
                Одоогоор хичээл байхгүй байна. Шинэ хичээл нэмнэ үү.
              </p>
              <Link
                href={`/lesson/new?grade=${grade.id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-3 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90"
              >
                <Plus className="h-4 w-4" />
                Шинэ хичээл нэмэх
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {lessons.map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
