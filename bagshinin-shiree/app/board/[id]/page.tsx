import { BoardEditor } from "@/components/boards/BoardEditor"

export default async function BoardPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <BoardEditor boardId={id} />
}
