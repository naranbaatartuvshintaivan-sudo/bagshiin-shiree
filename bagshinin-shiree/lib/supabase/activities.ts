import { createClient } from "./server"
import type {
  Activity,
  ActivityAttempt,
  ActivityAttemptInput,
  ActivityInput,
} from "./types"

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Activity[]
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Activity) ?? null
}

export async function getActivitiesByLesson(
  lessonId: string
): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Activity[]
}

export async function getRecentActivities(limit = 5): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as Activity[]
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Нэвтрэх шаардлагатай")
  const { data, error } = await supabase
    .from("activities")
    .insert({
      teacher_id: user.id,
      template: input.template,
      title: input.title,
      content: input.content ?? {},
      settings: input.settings ?? {},
      class_id: input.class_id ?? null,
      lesson_id: input.lesson_id ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Activity
}

export async function updateActivity(
  id: string,
  input: Partial<ActivityInput>
): Promise<Activity> {
  const supabase = await createClient()
  const patch: Record<string, unknown> = {}
  if (input.template !== undefined) patch.template = input.template
  if (input.title !== undefined) patch.title = input.title
  if (input.content !== undefined) patch.content = input.content
  if (input.settings !== undefined) patch.settings = input.settings
  if (input.class_id !== undefined) patch.class_id = input.class_id
  if (input.lesson_id !== undefined) patch.lesson_id = input.lesson_id
  const { data, error } = await supabase
    .from("activities")
    .update(patch)
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Activity
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function saveAttempt(
  input: ActivityAttemptInput
): Promise<ActivityAttempt> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activity_attempts")
    .insert({
      activity_id: input.activity_id,
      player_name: input.player_name ?? null,
      score: input.score ?? null,
      total: input.total ?? null,
      duration_ms: input.duration_ms ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ActivityAttempt
}
