import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/date"
import { getTemplateMeta } from "@/lib/activities/registry"
import { contentCount } from "@/lib/activities/utils"
import type { Activity } from "@/lib/supabase/types"

import { DeleteActivityButton } from "./DeleteActivityButton"

export function ActivityCard({ activity }: { activity: Activity }) {
  const meta = getTemplateMeta(activity.template)
  const Icon = meta.icon
  const count = contentCount(activity.content ?? {}, meta.contentKey)

  return (
    <div className="group relative rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-5 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/activities/${activity.id}`} className="block">
        <div className="flex items-center gap-2 text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
            <Icon className="h-5 w-5" />
          </span>
          <Badge variant="soft">{meta.name}</Badge>
        </div>
        <h3 className="mt-3 truncate text-lg font-semibold text-primary-deep">
          {activity.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{count} зүйл</span>
          <span aria-hidden>·</span>
          <span>
            Шинэчлэгдсэн:{" "}
            {formatShortDate(activity.updated_at || activity.created_at)}
          </span>
        </div>
      </Link>
      <DeleteActivityButton id={activity.id} />
    </div>
  )
}
