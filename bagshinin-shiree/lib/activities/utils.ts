import { TEMPLATES } from "./registry"
import type {
  ActivityContent,
  ActivityTemplate,
  ContentKey,
  PairItem,
  QuizQuestion,
  SentenceItem,
  SortGroup,
  ListItem,
} from "@/lib/supabase/types"

/** Санамсаргүй id (client талд шинэ мөр үүсгэхэд). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

/** Fisher–Yates холих — анхны массивыг өөрчлөхгүй. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function emptyPair(): PairItem {
  return { id: uid(), term: "", match: "" }
}

export function emptyQuestion(): QuizQuestion {
  return {
    id: uid(),
    question: "",
    answers: [
      { id: uid(), text: "", correct: true },
      { id: uid(), text: "", correct: false },
    ],
  }
}

export function emptyGroup(): SortGroup {
  return { id: uid(), name: "", items: [] }
}

export function emptySentence(): SentenceItem {
  return { id: uid(), text: "" }
}

export function emptyListItem(): ListItem {
  return { id: uid(), text: "" }
}

/** Загварын content түлхүүрт тохирох эхлэлийн агуулга (хоосон мөрүүдтэй). */
export function starterContent(template: ActivityTemplate): ActivityContent {
  const key = TEMPLATES[template].contentKey
  switch (key) {
    case "pairs":
      return { pairs: [emptyPair(), emptyPair(), emptyPair()] }
    case "questions":
      return { questions: [emptyQuestion()] }
    case "groups":
      return {
        groups: [
          { id: uid(), name: "", items: [] },
          { id: uid(), name: "", items: [] },
        ],
      }
    case "sentences":
      return { sentences: [emptySentence(), emptySentence()] }
    case "items":
      return { items: [emptyListItem(), emptyListItem(), emptyListItem()] }
    default:
      return {}
  }
}

/** Тухайн content түлхүүрийн бичлэгийн тоо. */
export function contentCount(
  content: ActivityContent,
  key: ContentKey
): number {
  const value = content[key]
  return Array.isArray(value) ? value.length : 0
}

/**
 * Anagram-д үсгийг холиход анхных нь эх үгтэй ижил гарахаас сэргийлнэ.
 */
export function scrambleLetters(word: string): string[] {
  const letters = word.split("")
  if (letters.length < 2) return letters
  let scrambled = shuffle(letters)
  let guard = 0
  while (scrambled.join("") === word && guard < 20) {
    scrambled = shuffle(letters)
    guard++
  }
  return scrambled
}
