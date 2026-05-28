import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { LessonForm } from "@/components/lessons/LessonForm"
import { getAllGrades, getLessonById } from "@/lib/supabase/queries"

export default async function EditLessonPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [lesson, grades] = await Promise.all([
    getLessonById(id),
    getAllGrades(),
  ])

  if (!lesson) notFound()

  return (
    <PageWrapper title="Хичээл засах">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/lesson/${lesson.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Link>
        <h1 className="mt-3 mb-6 text-2xl md:text-3xl font-bold text-primary-deep">
          Хичээл засах
        </h1>

        <LessonForm
          mode="edit"
          grades={grades.map(({ id, grade, label }) => ({ id, grade, label }))}
          initial={{
            id: lesson.id,
            class_id: lesson.class_id,
            title: lesson.title,
            content: typeof lesson.content?.text === "string" ? lesson.content.text : "",
            lesson_date: lesson.lesson_date,
            files: lesson.files,
          }}
        />
      </div>
    </PageWrapper>
  )
}
