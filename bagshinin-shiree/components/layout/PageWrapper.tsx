import { getGradesWithCounts } from "@/lib/supabase/queries"

import { PageShell } from "./PageShell"

type PageWrapperProps = {
  title?: string
  children: React.ReactNode
}

export async function PageWrapper({ title, children }: PageWrapperProps) {
  const grades = await getGradesWithCounts()
  return (
    <PageShell grades={grades} title={title}>
      {children}
    </PageShell>
  )
}
