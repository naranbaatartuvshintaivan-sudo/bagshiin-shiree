import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { LessonForm } from "@/components/lessons/LessonForm"
import { getAllGrades } from "@/lib/supabase/queries"

export default async function NewLessonPage(props: {
  searchParams: Promise<{ grade?: string }>
}) {
  const { grade } = await props.searchParams
  const grades = await getAllGrades()

  return (
    <PageWrapper title="Шинэ хичээл">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Link>
        <h1 className="mt-3 mb-6 text-2xl md:text-3xl font-bold text-primary-deep">
          Шинэ хичээл нэмэх
        </h1>

        <LessonForm
          mode="new"
          grades={grades.map(({ id, grade, label }) => ({ id, grade, label }))}
          defaultGradeId={grade}
        />
      </div>
    </PageWrapper>
  )
}
