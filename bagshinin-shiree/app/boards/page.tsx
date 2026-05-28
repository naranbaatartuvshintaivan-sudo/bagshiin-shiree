import { PageWrapper } from "@/components/layout/PageWrapper"
import { BoardsList } from "@/components/boards/BoardsList"

export default function BoardsPage() {
  return (
    <PageWrapper title="Самбар">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-deep">
            Самбар
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Төлөвлөгөө, mindmap, тэмдэглэл нэг талбарт.
          </p>
        </div>
        <BoardsList />
      </div>
    </PageWrapper>
  )
}
