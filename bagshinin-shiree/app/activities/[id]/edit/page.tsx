import { notFound } from "next/navigation"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { ActivityEditor } from "@/components/activities/ActivityEditor"
import { getActivityById } from "@/lib/supabase/activities"

export default async function EditActivityPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const activity = await getActivityById(id)
  if (!activity) notFound()

  return (
    <PageWrapper title={`${activity.title} — засвар`}>
      <div className="mx-auto max-w-4xl">
        <ActivityEditor activity={activity} />
      </div>
    </PageWrapper>
  )
}
