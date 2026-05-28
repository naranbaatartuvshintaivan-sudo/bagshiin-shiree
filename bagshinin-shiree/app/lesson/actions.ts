"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  createLesson,
  deleteFile,
  deleteLesson,
  updateLesson,
  uploadFile,
} from "@/lib/supabase/queries"

export async function saveLessonAction(formData: FormData) {
  const id = formData.get("id")?.toString() || ""
  const gradeId = formData.get("class_id")?.toString() || ""
  const title = formData.get("title")?.toString().trim() || ""
  const content = formData.get("content")?.toString() || ""
  const lessonDate = formData.get("lesson_date")?.toString() || ""

  if (!title || !gradeId) {
    throw new Error("Гарчиг ба анги шаардлагатай.")
  }

  const deletedIds = formData
    .getAll("deleted_file_ids")
    .map(String)
    .filter(Boolean)
  const newFiles = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)

  const contentJson = content.trim() ? { text: content } : {}

  let lessonId = id
  if (id) {
    await updateLesson(id, {
      class_id: gradeId,
      title,
      content: contentJson,
      lesson_date: lessonDate || null,
    })
  } else {
    const created = await createLesson({
      class_id: gradeId,
      title,
      content: contentJson,
      lesson_date: lessonDate || null,
    })
    lessonId = created.id
  }

  for (const fid of deletedIds) {
    await deleteFile(fid)
  }
  for (const file of newFiles) {
    await uploadFile(lessonId, file)
  }

  revalidatePath("/")
  revalidatePath(`/grade/${gradeId}`)
  revalidatePath(`/lesson/${lessonId}`)
  redirect(`/lesson/${lessonId}`)
}

export async function deleteLessonAction(id: string, gradeId: string) {
  await deleteLesson(id)
  revalidatePath("/")
  revalidatePath(`/grade/${gradeId}`)
  redirect(`/grade/${gradeId}`)
}
