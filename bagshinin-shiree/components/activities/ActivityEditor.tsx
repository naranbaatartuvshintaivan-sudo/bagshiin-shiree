"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, Play, Save } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { convertibleTemplates, getTemplateMeta } from "@/lib/activities/registry"
import { saveActivityAction } from "@/app/activities/actions"
import type {
  Activity,
  ActivityContent,
  ActivitySettings,
  ActivityTemplate,
} from "@/lib/supabase/types"

import {
  GroupsEditor,
  ListEditor,
  PairsEditor,
  QuestionsEditor,
  SentencesEditor,
  type PairLabels,
} from "./editors"

function pairLabels(template: ActivityTemplate): PairLabels {
  switch (template) {
    case "flash_cards":
      return { left: "Урд тал (асуулт)", right: "Ард тал (хариулт)" }
    case "find_match":
      return { left: "Асуулт / Үг", right: "Хариулт / Хослол" }
    case "matching_pairs":
      return { left: "Хос — A", right: "Хос — B" }
    case "open_box":
      return { left: "Шошго (заавал биш)", right: "Доторх зүйл" }
    default:
      return { left: "Түлхүүр үг", right: "Тодорхойлолт" }
  }
}

function sentenceConfig(template: ActivityTemplate) {
  switch (template) {
    case "anagram":
      return {
        label: "Үг",
        placeholder: "Нэг үг (жишээ: сурагч)",
        withBlanks: false,
      }
    case "unjumble":
      return {
        label: "Өгүүлбэр",
        placeholder: "Зөв дараалал бүхий өгүүлбэр",
        withBlanks: false,
      }
    default:
      return {
        label: "Өгүүлбэр",
        placeholder: "Өгүүлбэрээ бичнэ үү",
        withBlanks: true,
      }
  }
}

type SaveStatus = "idle" | "saving" | "saved"

export function ActivityEditor({ activity }: { activity: Activity }) {
  const [title, setTitle] = useState(activity.title)
  const [template, setTemplate] = useState<ActivityTemplate>(activity.template)
  const [content, setContent] = useState<ActivityContent>(activity.content ?? {})
  const [settings, setSettings] = useState<ActivitySettings>(
    activity.settings ?? {}
  )
  const [status, setStatus] = useState<SaveStatus>("idle")

  const firstRender = useRef(true)
  const meta = getTemplateMeta(template)
  const switchOptions = convertibleTemplates(template)

  const debouncedSave = useDebouncedCallback(async () => {
    setStatus("saving")
    try {
      await saveActivityAction({
        id: activity.id,
        title: title.trim() || meta.name,
        template,
        content,
        settings,
      })
      setStatus("saved")
    } catch (err) {
      setStatus("idle")
      toast.error(err instanceof Error ? err.message : "Хадгалах үед алдаа.")
    }
  }, 900)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setStatus("saving")
    debouncedSave()
  }, [title, template, content, settings, debouncedSave])

  function setContentKey<K extends keyof ActivityContent>(
    key: K,
    value: ActivityContent[K]
  ) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSetting(key: keyof ActivitySettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function saveNow() {
    debouncedSave.cancel()
    setStatus("saving")
    try {
      await saveActivityAction({
        id: activity.id,
        title: title.trim() || meta.name,
        template,
        content,
        settings,
      })
      setStatus("saved")
      toast.success("Хадгалагдлаа")
    } catch (err) {
      setStatus("idle")
      toast.error(err instanceof Error ? err.message : "Хадгалах үед алдаа.")
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Жагсаалт
        </Link>
        <div className="flex items-center gap-2">
          <SaveIndicator status={status} />
          <button
            type="button"
            onClick={saveNow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-deep px-3 py-1.5 text-xs font-medium text-primary-deep hover:bg-primary-soft/30 dark:border-primary-soft/40 dark:text-primary-soft dark:hover:bg-primary-soft/10"
          >
            <Save className="h-3.5 w-3.5" />
            Хадгалах
          </button>
          <Link
            href={`/activities/${activity.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-orange/90"
          >
            <Play className="h-3.5 w-3.5" />
            Тоглох
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
            <meta.icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider">
            {meta.name}
          </span>
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Дасгалын гарчиг"
          className="mt-3 h-12 border-0 bg-transparent px-0 text-xl font-bold focus:ring-0"
        />
        <p className="text-sm text-[var(--text-muted)]">{meta.description}</p>

        {switchOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Загвар солих:
            </span>
            <Select
              value={template}
              onChange={(e) =>
                setTemplate(e.target.value as ActivityTemplate)
              }
              className="h-9 w-auto"
            >
              <option value={template}>{meta.name} (одоогийн)</option>
              {switchOptions.map((t) => (
                <option key={t.template} value={t.template}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-primary-deep">Агуулга</h2>
        {meta.contentKey === "pairs" && (
          <PairsEditor
            pairs={content.pairs ?? []}
            onChange={(next) => setContentKey("pairs", next)}
            labels={pairLabels(template)}
          />
        )}
        {meta.contentKey === "questions" && (
          <QuestionsEditor
            questions={content.questions ?? []}
            onChange={(next) => setContentKey("questions", next)}
          />
        )}
        {meta.contentKey === "groups" && (
          <GroupsEditor
            groups={content.groups ?? []}
            onChange={(next) => setContentKey("groups", next)}
          />
        )}
        {meta.contentKey === "sentences" &&
          (() => {
            const cfg = sentenceConfig(template)
            return (
              <SentencesEditor
                sentences={content.sentences ?? []}
                onChange={(next) => setContentKey("sentences", next)}
                label={cfg.label}
                placeholder={cfg.placeholder}
                withBlanks={cfg.withBlanks}
              />
            )
          })()}
        {meta.contentKey === "items" && (
          <ListEditor
            items={content.items ?? []}
            onChange={(next) => setContentKey("items", next)}
            label="Зүйлийн текст"
          />
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-primary-deep">
          Тохиргоо
        </h2>
        <div className="flex flex-wrap gap-2">
          <SettingToggle
            label="Таймер"
            checked={!!settings.timer}
            onClick={() => toggleSetting("timer")}
          />
          <SettingToggle
            label="Дахин холих"
            checked={!!settings.shuffle}
            onClick={() => toggleSetting("shuffle")}
          />
          <SettingToggle
            label="Оноо харуулах"
            checked={!!settings.showScore}
            onClick={() => toggleSetting("showScore")}
          />
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Хадгалж байна
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        <Check className="h-3.5 w-3.5" />
        Хадгалагдсан
      </span>
    )
  }
  return null
}

function SettingToggle({
  label,
  checked,
  onClick,
}: {
  label: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        checked
          ? "border-primary bg-primary-soft/40 text-primary-deep"
          : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-primary"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border",
          checked ? "border-primary bg-primary text-white" : "border-current"
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </span>
      {label}
    </button>
  )
}
