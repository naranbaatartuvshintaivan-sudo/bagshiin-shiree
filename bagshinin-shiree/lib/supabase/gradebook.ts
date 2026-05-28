import { createClient } from "./client"
import type { GradeColumn, GradeRow, Gradebook } from "./types"

export async function getOrCreateGradebookForClass(
  classId: string
): Promise<Gradebook> {
  const supabase = createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) throw new Error("Нэвтрэх шаардлагатай")

  const { data: existing, error: selErr } = await supabase
    .from("gradebooks")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (selErr) throw new Error(selErr.message)
  if (existing) return existing as Gradebook

  const { data: created, error: insErr } = await supabase
    .from("gradebooks")
    .insert({
      class_id: classId,
      teacher_id: user.id,
      name: "Дүнгийн дэвтэр",
      columns: [],
      rows: [],
    })
    .select()
    .single()
  if (insErr) throw new Error(insErr.message)
  return created as Gradebook
}

export async function saveGradebook(
  id: string,
  columns: GradeColumn[],
  rows: GradeRow[]
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("gradebooks")
    .update({ columns, rows })
    .eq("id", id)
  if (error) throw new Error(error.message)
}
