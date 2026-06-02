"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Repeat } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  TEMPLATE_LIST,
  getTemplateMeta,
  isContentCompatible,
} from "@/lib/activities/registry"
import type { Activity, ActivityTemplate } from "@/lib/supabase/types"

import { AnagramPlayer } from "./players/AnagramPlayer"
import { CompleteSentencePlayer } from "./players/CompleteSentencePlayer"
import { FindMatchPlayer } from "./players/FindMatchPlayer"
import { FlashCardsPlayer } from "./players/FlashCardsPlayer"
import { GroupSortPlayer } from "./players/GroupSortPlayer"
import { MatchUpPlayer } from "./players/MatchUpPlayer"
import { MatchingPairsPlayer } from "./players/MatchingPairsPlayer"
import { OpenBoxPlayer } from "./players/OpenBoxPlayer"
import { QuizPlayer } from "./players/QuizPlayer"
import { SpeakingCardsPlayer } from "./players/SpeakingCardsPlayer"
import { SpinWheelPlayer } from "./players/SpinWheelPlayer"
import { UnjumblePlayer } from "./players/UnjumblePlayer"

function renderPlayer(activity: Activity) {
  switch (activity.template) {
    case "match_up":
      return <MatchUpPlayer activity={activity} />
    case "quiz":
      return <QuizPlayer activity={activity} />
    case "flash_cards":
      return <FlashCardsPlayer activity={activity} />
    case "speaking_cards":
      return <SpeakingCardsPlayer activity={activity} />
    case "spin_wheel":
      return <SpinWheelPlayer activity={activity} />
    case "group_sort":
      return <GroupSortPlayer activity={activity} />
    case "complete_sentence":
      return <CompleteSentencePlayer activity={activity} />
    case "find_match":
      return <FindMatchPlayer activity={activity} />
    case "unjumble":
      return <UnjumblePlayer activity={activity} />
    case "anagram":
      return <AnagramPlayer activity={activity} />
    case "matching_pairs":
      return <MatchingPairsPlayer activity={activity} />
    case "open_box":
      return <OpenBoxPlayer activity={activity} />
    default:
      return null
  }
}

export function ActivityPlayer({ activity }: { activity: Activity }) {
  const [template, setTemplate] = useState<ActivityTemplate>(activity.template)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const meta = getTemplateMeta(template)
  const played: Activity = { ...activity, template }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Жагсаалт
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSwitcherOpen((o) => !o)}
            aria-expanded={switcherOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30 dark:text-primary-soft dark:hover:bg-primary-soft/10"
          >
            <Repeat className="h-3.5 w-3.5" />
            Загвар солих
          </button>
          <Link
            href={`/activities/${activity.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-deep px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30 dark:border-primary-soft/40 dark:text-primary-soft dark:hover:bg-primary-soft/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            Засах
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
          <meta.icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-primary-deep">
            {activity.title}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">{meta.name}</p>
        </div>
      </div>

      {switcherOpen && (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
            Энэ агуулгаар тоглож болох загварууд:
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_LIST.map((t) => {
              const compatible = isContentCompatible(
                activity.content ?? {},
                t.template
              )
              const active = t.template === template
              const Icon = t.icon
              return (
                <button
                  key={t.template}
                  type="button"
                  disabled={!compatible}
                  onClick={() => {
                    if (!compatible) return
                    setTemplate(t.template)
                    setSwitcherOpen(false)
                  }}
                  title={
                    compatible
                      ? t.name
                      : "Энэ загварт энэ агуулга тохирохгүй"
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active && "border-primary bg-primary text-white",
                    !active &&
                      compatible &&
                      "border-[var(--border-soft)] text-[var(--text-ink)] hover:border-primary",
                    !compatible &&
                      "cursor-not-allowed border-dashed border-[var(--border-soft)] text-[var(--text-muted)] opacity-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div key={template}>{renderPlayer(played)}</div>
    </div>
  )
}
