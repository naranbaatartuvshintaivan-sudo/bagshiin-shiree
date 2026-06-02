import { notFound } from "next/navigation"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { ActivityPlayer } from "@/components/activities/ActivityPlayer"
import { getActivityById } from "@/lib/supabase/activities"

export default async function ActivityPlayPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const activity = await getActivityById(id)
  if (!activity) notFound()

  return (
    <PageWrapper title={activity.title}>
      <div className="mx-auto max-w-4xl">
        <ActivityPlayer activity={activity} />
      </div>
    </PageWrapper>
  )
}
