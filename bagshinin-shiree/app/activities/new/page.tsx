import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { TemplateGrid } from "@/components/activities/TemplateGrid"

export default async function NewActivityPage(props: {
  searchParams: Promise<{ lesson_id?: string; class_id?: string }>
}) {
  const { lesson_id, class_id } = await props.searchParams

  return (
    <PageWrapper title="Загвар сонгох">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link
            href={lesson_id ? `/lesson/${lesson_id}` : "/activities"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-primary-deep">
            Загвар сонгоод дэлгэрэнгүйг үзнэ үү
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Агуулгаа нэг удаа оруулаад дараа нь загвар хооронд шилжүүлэн тоглож
            болно.
          </p>
        </div>

        <TemplateGrid lessonId={lesson_id} classId={class_id} />
      </div>
    </PageWrapper>
  )
}
