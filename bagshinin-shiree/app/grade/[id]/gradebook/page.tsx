import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { GradebookLoader } from "@/components/gradebook/GradebookLoader"
import { formatClassName } from "@/lib/utils"
import { getGradeById } from "@/lib/supabase/queries"

export default async function GradebookPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const grade = await getGradeById(id)
  if (!grade) notFound()

  const className = formatClassName(grade.grade, grade.label)

  return (
    <PageWrapper title={`${className} — Дүнгийн дэвтэр`}>
      <div className="mx-auto max-w-6xl space-y-4">
        <Link
          href={`/grade/${grade.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-deep">
            Дүнгийн дэвтэр
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{className}</p>
        </div>
        <GradebookLoader classId={grade.id} className={className} />
      </div>
    </PageWrapper>
  )
}
