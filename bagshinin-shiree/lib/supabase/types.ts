export type Grade = {
  id: string
  teacher_id: string
  label: string | null
  grade: number
  color: string | null
  created_at: string
}

export type LessonContentJson = { text?: string } & Record<string, unknown>

export type Lesson = {
  id: string
  class_id: string
  teacher_id: string
  title: string
  content: LessonContentJson | null
  lesson_date: string | null
  is_pinned: boolean | null
  created_at: string
  updated_at: string | null
}

export type LessonFile = {
  id: string
  lesson_id: string
  storage_path: string
  file_name: string
  file_type: string
  created_at: string
}

export type LessonWithGrade = Lesson & {
  grade: Pick<Grade, "id" | "grade" | "label"> | null
}

export type LessonWithFiles = Lesson & {
  files: LessonFile[]
}

export type LessonWithRelations = Lesson & {
  grade: Pick<Grade, "id" | "grade" | "label"> | null
  files: LessonFile[]
}

export type GradeWithCount = Grade & {
  lesson_count: number
  last_updated: string | null
}

export type LessonInput = {
  class_id: string
  title: string
  content?: LessonContentJson | null
  lesson_date?: string | null
}
