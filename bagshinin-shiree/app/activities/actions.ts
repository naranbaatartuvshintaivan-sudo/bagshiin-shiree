"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  createActivity,
  deleteActivity,
  getActivityById,
  saveAttempt,
  updateActivity,
} from "@/lib/supabase/activities"
import { isActivityTemplate, TEMPLATES } from "@/lib/activities/registry"
import { starterContent } from "@/lib/activities/utils"
import type {
  ActivityAttemptInput,
  ActivityContent,
  ActivitySettings,
  ActivityTemplate,
} from "@/lib/supabase/types"

/** Загвар сонгоод хоосон дасгал үүсгэж засварлах хуудас руу шилжинэ. */
export async function createActivityAction(formData: FormData) {
  const template = formData.get("template")?.toString() ?? ""
  const lessonId = formData.get("lesson_id")?.toString() || null
  const classId = formData.get("class_id")?.toString() || null
  if (!isActivityTemplate(template)) {
    throw new Error("Тодорхойгүй загвар")
  }
  const created = await createActivity({
    template,
    title: TEMPLATES[template].name,
    content: starterContent(template),
    settings: { showScore: true },
    lesson_id: lessonId,
    class_id: classId,
  })
  revalidatePath("/activities")
  if (lessonId) revalidatePath(`/lesson/${lessonId}`)
  redirect(`/activities/${created.id}/edit`)
}

type SaveActivityInput = {
  id: string
  title?: string
  template?: ActivityTemplate
  content?: ActivityContent
  settings?: ActivitySettings
  class_id?: string | null
  lesson_id?: string | null
}

/** Засварлагчийн авто-хадгалалт/гар хадгалалт (redirect хийхгүй). */
export async function saveActivityAction(input: SaveActivityInput) {
  const { id, ...rest } = input
  if (!id) throw new Error("id шаардлагатай")
  await updateActivity(id, rest)
  revalidatePath("/activities")
  revalidatePath(`/activities/${id}`)
  revalidatePath(`/activities/${id}/edit`)
  const current = await getActivityById(id)
  if (current?.lesson_id) revalidatePath(`/lesson/${current.lesson_id}`)
}

export async function deleteActivityAction(id: string) {
  const current = await getActivityById(id)
  const lessonId = current?.lesson_id ?? null
  await deleteActivity(id)
  revalidatePath("/activities")
  revalidatePath("/")
  if (lessonId) revalidatePath(`/lesson/${lessonId}`)
  redirect("/activities")
}

export async function saveAttemptAction(input: ActivityAttemptInput) {
  await saveAttempt(input)
}
