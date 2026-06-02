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

export type GradeColumnType = "number" | "text" | "attendance"

export type GradeColumn = {
  id: string
  name: string
  type: GradeColumnType
}

export type GradeRow = {
  id: string
  name: string
  cells: Record<string, string | number | null>
}

export type Gradebook = {
  id: string
  class_id: string
  teacher_id: string
  name: string
  columns: GradeColumn[]
  rows: GradeRow[]
  created_at: string
  updated_at: string | null
}

export type Board = {
  id: string
  teacher_id: string
  class_id: string | null
  title: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Интерактив дасгал/тоглоом (Wordwall маягийн загварууд)
// ──────────────────────────────────────────────────────────────────────────

export type ActivityTemplate =
  | "match_up"
  | "quiz"
  | "flash_cards"
  | "speaking_cards"
  | "spin_wheel"
  | "group_sort"
  | "complete_sentence"
  | "find_match"
  | "unjumble"
  | "anagram"
  | "matching_pairs"
  | "open_box"

// Хос-д суурилсан (Match up, Matching pairs, Find match, Flash cards, Open box)
export type PairItem = { id: string; term: string; match: string; image?: string }

// Quiz / Find match
export type QuizQuestion = {
  id: string
  question: string
  answers: { id: string; text: string; correct: boolean }[]
}

// Group sort
export type SortGroup = { id: string; name: string; items: string[] }

// Өгүүлбэр (Complete sentence, Unjumble, Anagram)
export type SentenceItem = { id: string; text: string; blanks?: string[] }

// Энгийн жагсаалт (Spin wheel, Speaking cards)
export type ListItem = { id: string; text: string }

export type ActivityContent = {
  pairs?: PairItem[]
  questions?: QuizQuestion[]
  groups?: SortGroup[]
  sentences?: SentenceItem[]
  items?: ListItem[]
}

// content түлхүүрүүдийн нэр — registry болон хөрвүүлэлтэд ашиглана
export type ContentKey = keyof ActivityContent

export type ActivitySettings = {
  timer?: boolean
  shuffle?: boolean
  showScore?: boolean
}

export type Activity = {
  id: string
  teacher_id: string
  class_id: string | null
  lesson_id: string | null
  template: ActivityTemplate
  title: string
  content: ActivityContent
  settings: ActivitySettings
  created_at: string
  updated_at: string | null
}

export type ActivityInput = {
  template: ActivityTemplate
  title: string
  content?: ActivityContent
  settings?: ActivitySettings
  class_id?: string | null
  lesson_id?: string | null
}

export type ActivityAttempt = {
  id: string
  activity_id: string
  player_name: string | null
  score: number | null
  total: number | null
  duration_ms: number | null
  created_at: string
}

export type ActivityAttemptInput = {
  activity_id: string
  player_name?: string | null
  score?: number | null
  total?: number | null
  duration_ms?: number | null
}
