import { createClient } from "./server"
import type {
  Grade,
  GradeWithCount,
  Lesson,
  LessonFile,
  LessonInput,
  LessonWithGrade,
  LessonWithRelations,
} from "./types"

const BUCKET = "lesson-assets"

export async function getAllGrades(): Promise<Grade[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("grade", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getGradesWithCounts(): Promise<GradeWithCount[]> {
  const supabase = await createClient()
  const [{ data: grades, error: gErr }, { data: lessons, error: lErr }] =
    await Promise.all([
      supabase.from("classes").select("*").order("grade", { ascending: true }),
      supabase.from("lessons").select("id, class_id, created_at, lesson_date"),
    ])
  if (gErr) throw new Error(gErr.message)
  if (lErr) throw new Error(lErr.message)

  return (grades ?? []).map((g) => {
    const own = (lessons ?? []).filter((l) => l.class_id === g.id)
    const last = own.reduce<string | null>((acc, l) => {
      const candidate = l.lesson_date || l.created_at
      if (!candidate) return acc
      if (!acc) return candidate
      return candidate > acc ? candidate : acc
    }, null)
    return { ...g, lesson_count: own.length, last_updated: last }
  })
}

export async function getGradeById(gradeId: string): Promise<Grade | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", gradeId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function getLessonsByGrade(gradeId: string): Promise<
  (Lesson & { file_count: number })[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .select("*, lesson_files(id)")
    .eq("class_id", gradeId)
    .order("lesson_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => {
    const { lesson_files, ...rest } = row as Lesson & {
      lesson_files: { id: string }[]
    }
    return { ...rest, file_count: lesson_files?.length ?? 0 }
  })
}

export async function getLessonById(
  lessonId: string
): Promise<LessonWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .select("*, grade:classes(id, grade, label), lesson_files(*)")
    .eq("id", lessonId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const { lesson_files, ...rest } = data as Lesson & {
    grade: { id: string; grade: number; label: string | null } | null
    lesson_files: LessonFile[]
  }
  return { ...rest, files: lesson_files ?? [] }
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Нэвтрэх шаардлагатай")
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      class_id: input.class_id,
      teacher_id: user.id,
      title: input.title,
      content: input.content ?? {},
      lesson_date: input.lesson_date ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateLesson(
  id: string,
  input: Partial<LessonInput>
): Promise<Lesson> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .update({
      class_id: input.class_id,
      title: input.title,
      content: input.content ?? {},
      lesson_date: input.lesson_date ?? null,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteLesson(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: files } = await supabase
    .from("lesson_files")
    .select("storage_path")
    .eq("lesson_id", id)
  const paths = (files ?? [])
    .map((f) => f.storage_path)
    .filter((p): p is string => Boolean(p))
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths)
  }
  const { error } = await supabase.from("lessons").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function getRecentLessons(
  limit = 5
): Promise<LessonWithGrade[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .select("*, grade:classes(id, grade, label)")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as LessonWithGrade[]
}

export async function getStats(): Promise<{
  totalLessons: number
  thisWeek: number
  totalFiles: number
}> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: totalLessons },
    { count: thisWeek },
    { count: totalFiles },
  ] = await Promise.all([
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("lesson_files").select("*", { count: "exact", head: true }),
  ])

  return {
    totalLessons: totalLessons ?? 0,
    thisWeek: thisWeek ?? 0,
    totalFiles: totalFiles ?? 0,
  }
}

export async function uploadFile(
  lessonId: string,
  file: File
): Promise<LessonFile> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Нэвтрэх шаардлагатай")
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".") + 1)
    : ""
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 60)
  // First folder must equal auth.uid() to satisfy storage RLS policy.
  const objectKey = `${user.id}/${lessonId}/${Date.now()}-${safeBase}${ext ? "." + ext : ""}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(objectKey, file, {
      contentType: file.type || undefined,
      upsert: false,
    })
  if (upErr) throw new Error(upErr.message)

  const { data, error } = await supabase
    .from("lesson_files")
    .insert({
      lesson_id: lessonId,
      storage_path: objectKey,
      file_name: file.name,
      file_type: file.type || ext || "application/octet-stream",
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteFile(fileId: string): Promise<void> {
  const supabase = await createClient()
  const { data: existing, error: selErr } = await supabase
    .from("lesson_files")
    .select("storage_path")
    .eq("id", fileId)
    .maybeSingle()
  if (selErr) throw new Error(selErr.message)
  if (!existing) return

  if (existing.storage_path) {
    await supabase.storage.from(BUCKET).remove([existing.storage_path])
  }
  const { error } = await supabase.from("lesson_files").delete().eq("id", fileId)
  if (error) throw new Error(error.message)
}

export async function createGrade(grade: number, label: string | null): Promise<Grade> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Нэвтрэх шаардлагатай")
  const { data, error } = await supabase
    .from("classes")
    .insert({ grade, label: label || null, teacher_id: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteGrade(id: string): Promise<void> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("class_id", id)
  if ((count ?? 0) > 0) {
    throw new Error("Энэ ангид хичээл бүртгэгдсэн тул устгах боломжгүй.")
  }
  const { error } = await supabase.from("classes").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function reorderGrades(_orderedIds: string[]): Promise<void> {
  // classes table has no order column; sorted by grade (1-12) from the DB
}

