"use server"

import { revalidatePath } from "next/cache"

import {
  createGrade,
  deleteGrade,
  reorderGrades,
} from "@/lib/supabase/queries"

export async function createGradeAction(grade: number, label: string | null) {
  if (!grade || grade < 1 || grade > 12) throw new Error("Анги сонгоно уу.")
  await createGrade(grade, label)
  revalidatePath("/")
  revalidatePath("/settings")
}

export async function deleteGradeAction(id: string) {
  await deleteGrade(id)
  revalidatePath("/")
  revalidatePath("/settings")
}

export async function reorderGradesAction(orderedIds: string[]) {
  await reorderGrades(orderedIds)
  revalidatePath("/")
  revalidatePath("/settings")
}
