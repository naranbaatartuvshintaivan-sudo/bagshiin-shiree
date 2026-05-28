import { createClient } from "./client"
import type { Board } from "./types"

export async function listBoards(): Promise<Board[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Board[]
}

export async function getBoard(id: string): Promise<Board | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Board) ?? null
}

export async function createBoard(title?: string): Promise<Board> {
  const supabase = createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) throw new Error("Нэвтрэх шаардлагатай")
  const { data, error } = await supabase
    .from("boards")
    .insert({
      teacher_id: user.id,
      title: title?.trim() || "Сарын төлөвлөгөө",
      data: {},
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Board
}

export async function saveBoardData(
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("boards").update({ data }).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function renameBoard(id: string, title: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("boards")
    .update({ title: title.trim() || "Сарын төлөвлөгөө" })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deleteBoard(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("boards").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
