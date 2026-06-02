import Link from "next/link"
import { Gamepad2, Plus } from "lucide-react"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { ActivityCard } from "@/components/activities/ActivityCard"
import { getActivities } from "@/lib/supabase/activities"

export default async function ActivitiesPage() {
  const activities = await getActivities()

  return (
    <PageWrapper title="Дасгал / Тоглоом">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-deep">
              Дасгал / Тоглоом
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Интерактив дасгал үүсгэж, хичээлдээ хавсаргаж тоглуулна.
            </p>
          </div>
          <Link
            href="/activities/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-orange px-3 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90"
          >
            <Plus className="h-4 w-4" />
            Шинэ дасгал
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-12 text-center">
            <Gamepad2 className="h-10 w-10 text-primary" />
            <p className="text-sm text-[var(--text-muted)]">
              Одоогоор дасгал байхгүй байна. Эхний дасгалаа үүсгэнэ үү.
            </p>
            <Link
              href="/activities/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-4 py-2 text-sm font-semibold text-white hover:bg-accent-orange/90"
            >
              <Plus className="h-4 w-4" />
              Дасгал үүсгэх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
