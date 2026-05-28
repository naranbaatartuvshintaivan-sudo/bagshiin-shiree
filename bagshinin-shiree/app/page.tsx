import Link from "next/link"
import { BookOpen, Files, Plus, Sparkles } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { GradeCard } from "@/components/grades/GradeCard"
import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/date"
import { formatClassName } from "@/lib/utils"
import {
  getGradesWithCounts,
  getRecentLessons,
  getStats,
} from "@/lib/supabase/queries"

export default async function DashboardPage() {
  const [grades, recent, stats] = await Promise.all([
    getGradesWithCounts(),
    getRecentLessons(5),
    getStats(),
  ])

  return (
    <PageWrapper title="Хяналтын самбар">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-deep">
            Багшийн Ширээ
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Монгол хэлний багш</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Нийт хичээл"
            value={stats.totalLessons}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            label="Энэ долоо хоног"
            value={stats.thisWeek}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <StatCard
            label="Нийт файл"
            value={stats.totalFiles}
            icon={<Files className="h-5 w-5" />}
          />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-primary-deep">
            Ангиуд
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {grades.map((g) => (
              <GradeCard key={g.id} grade={g} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-primary-deep">
            Сүүлийн хичээлүүд
          </h2>
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-8 text-center text-sm text-[var(--text-muted)]">
              Одоогоор хичээл байхгүй байна.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-soft)] rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)]">
              {recent.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/lesson/${l.id}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-primary-soft/20 dark:hover:bg-primary-soft/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {l.grade && (
                        <Badge variant="primary">{formatClassName(l.grade.grade, l.grade.label)}</Badge>
                      )}
                      <span className="truncate font-medium text-[var(--text-ink)]">
                        {l.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">
                      {formatShortDate(l.lesson_date || l.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link
        href="/lesson/new"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-accent-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-orange/30 transition-transform hover:scale-105"
      >
        <Plus className="h-4 w-4" />
        Хичээл нэмэх
      </Link>
    </PageWrapper>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primary-soft p-4 text-primary-deep">
      <div className="rounded-xl bg-white/60 p-2 text-primary-deep">{icon}</div>
      <div>
        <div className="text-xs font-medium text-primary-deep/70">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  )
}
