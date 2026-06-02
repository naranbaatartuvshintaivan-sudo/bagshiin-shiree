import type { ComponentType, SVGProps } from "react"
import {
  ArrowLeftRight,
  ArrowUpDown,
  Boxes,
  Copy,
  Layers,
  ListChecks,
  MessageCircle,
  Package,
  PenLine,
  RotateCw,
  Shuffle,
  Target,
} from "lucide-react"

import type {
  ActivityContent,
  ActivityTemplate,
  ContentKey,
} from "@/lib/supabase/types"

type IconType = ComponentType<SVGProps<SVGSVGElement>>

export type TemplateMeta = {
  template: ActivityTemplate
  /** Монгол нэр */
  name: string
  /** 1 мөр тайлбар */
  description: string
  icon: IconType
  /** Энэ загварын ашиглах content түлхүүр */
  contentKey: ContentKey
}

// Загвар бүр аль content түлхүүрийг ашиглахыг тодорхойлно. Ижил түлхүүртэй
// загварууд хоорондоо чөлөөтэй хөрвөнө (registry-ийн convertibleTemplates).
export const TEMPLATES: Record<ActivityTemplate, TemplateMeta> = {
  match_up: {
    template: "match_up",
    name: "Тааруулах",
    description: "Түлхүүр үгийг тодорхойлолттой нь чирж тааруул",
    icon: ArrowLeftRight,
    contentKey: "pairs",
  },
  quiz: {
    template: "quiz",
    name: "Сорил",
    description: "Олон сонголттой асуултууд, зөв хариултыг сонго",
    icon: ListChecks,
    contentKey: "questions",
  },
  flash_cards: {
    template: "flash_cards",
    name: "Картан тэмдэглэл",
    description: "Урд талд асуулт, ард талд хариулт бүхий карт",
    icon: Layers,
    contentKey: "pairs",
  },
  speaking_cards: {
    template: "speaking_cards",
    name: "Ярианы карт",
    description: "Холигдсон багцаас санамсаргүй карт татах",
    icon: MessageCircle,
    contentKey: "items",
  },
  spin_wheel: {
    template: "spin_wheel",
    name: "Хүрд эргүүлэх",
    description: "Хүрд эргүүлж дараагийн зүйлийг сонгох",
    icon: RotateCw,
    contentKey: "items",
  },
  group_sort: {
    template: "group_sort",
    name: "Бүлэглэх",
    description: "Зүйл бүрийг зөв бүлэгт нь чирж хийх",
    icon: Boxes,
    contentKey: "groups",
  },
  complete_sentence: {
    template: "complete_sentence",
    name: "Өгүүлбэр гүйцээх",
    description: "Зөв үгийг хоосон зайнд чирж тавих",
    icon: PenLine,
    contentKey: "sentences",
  },
  find_match: {
    template: "find_match",
    name: "Хослыг олох",
    description: "Тохирох хариултыг дарж арилгах",
    icon: Target,
    contentKey: "pairs",
  },
  unjumble: {
    template: "unjumble",
    name: "Эрэмбэлэх",
    description: "Үгсийг чирж зөв дарааллаар нь өрөх",
    icon: ArrowUpDown,
    contentKey: "sentences",
  },
  anagram: {
    template: "anagram",
    name: "Үг эвлүүлэх",
    description: "Үсгүүдийг чирж зөв үгийг эвлүүлэх",
    icon: Shuffle,
    contentKey: "sentences",
  },
  matching_pairs: {
    template: "matching_pairs",
    name: "Хос тааруулах",
    description: "Хос картыг эргүүлж ижлийг нь олох",
    icon: Copy,
    contentKey: "pairs",
  },
  open_box: {
    template: "open_box",
    name: "Хайрцаг нээх",
    description: "Хайрцаг бүрийг нээж доторх зүйлийг харах",
    icon: Package,
    contentKey: "pairs",
  },
}

// Дэлгэцэнд харуулах эрэмбэ (хавсаргасан Wordwall зургийн дарааллыг даган)
export const TEMPLATE_LIST: TemplateMeta[] = [
  TEMPLATES.match_up,
  TEMPLATES.quiz,
  TEMPLATES.flash_cards,
  TEMPLATES.speaking_cards,
  TEMPLATES.spin_wheel,
  TEMPLATES.group_sort,
  TEMPLATES.complete_sentence,
  TEMPLATES.find_match,
  TEMPLATES.unjumble,
  TEMPLATES.anagram,
  TEMPLATES.matching_pairs,
  TEMPLATES.open_box,
]

export const ALL_TEMPLATES = Object.keys(TEMPLATES) as ActivityTemplate[]

export function isActivityTemplate(value: string): value is ActivityTemplate {
  return value in TEMPLATES
}

export function getTemplateMeta(template: ActivityTemplate): TemplateMeta {
  return TEMPLATES[template]
}

/**
 * Тухайн загвартай ижил content түлхүүртэй бусад загварууд.
 * Эдгээр рүү агуулга өөрчлөхгүйгээр шилжиж тоглож болно.
 */
export function convertibleTemplates(
  template: ActivityTemplate
): TemplateMeta[] {
  const key = TEMPLATES[template].contentKey
  return TEMPLATE_LIST.filter(
    (t) => t.template !== template && t.contentKey === key
  )
}

/**
 * Одоогийн агуулга шинэ загварт тохирох эсэх — шинэ загварын ашиглах
 * content түлхүүрт ядаж нэг бичлэг байгаа эсэхээр шийднэ.
 */
export function isContentCompatible(
  content: ActivityContent,
  template: ActivityTemplate
): boolean {
  const key = TEMPLATES[template].contentKey
  const value = content[key]
  return Array.isArray(value) && value.length > 0
}
