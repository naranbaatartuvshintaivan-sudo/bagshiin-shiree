import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { GradeManager } from "@/components/settings/GradeManager"
import { TeacherNameField } from "@/components/settings/TeacherNameField"
import { getGradesWithCounts } from "@/lib/supabase/queries"

export default async function SettingsPage() {
  const grades = await getGradesWithCounts()

  return (
    <PageWrapper title="Тохиргоо">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-primary-deep">
            Тохиргоо
          </h1>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primary-deep">
            Багшийн мэдээлэл
          </h2>
          <div className="rounded-2xl border border-primary-soft/50 bg-white p-5">
            <TeacherNameField />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primary-deep">Ангиуд</h2>
          <p className="text-sm text-ink/60">
            Чирж байрлал солих эсвэл шинэ анги нэмж болно.
          </p>
          <GradeManager initialGrades={grades} />
        </section>
      </div>
    </PageWrapper>
  )
}
