"use client"

import { useState } from "react"
import {
  Download,
  FileImage,
  FileText,
  File as FileIcon,
  Presentation,
  X,
} from "lucide-react"

import { FilePreview, type PreviewFile } from "@/components/file-preview"
import { formatFileSize } from "@/lib/date"
import { cn } from "@/lib/utils"

export type DisplayFile = {
  id: string
  name: string
  url?: string
  type: string | null | undefined
  size: number | null | undefined
}

type FileGridProps = {
  files: DisplayFile[]
  onRemove?: (id: string) => void
  variant?: "edit" | "view"
}

export function FileGrid({ files, onRemove, variant = "edit" }: FileGridProps) {
  const [preview, setPreview] = useState<PreviewFile | null>(null)

  if (files.length === 0) return null

  const openPreview = (f: DisplayFile) => {
    if (!f.url) return
    setPreview({ name: f.name, url: f.url, type: f.type })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {files.map((f) => {
          const kind = detectKind(f.name, f.type)
          const clickable = variant === "view" && Boolean(f.url)
          return (
            <div
              key={f.id}
              onClick={clickable ? () => openPreview(f) : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openPreview(f)
                      }
                    }
                  : undefined
              }
              className={cn(
                "group relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)]",
                clickable && "cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            >
              {kind === "image" && f.url ? (
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.url}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center bg-primary-soft/20 p-3 text-primary-deep">
                  {kind === "pdf" ? (
                    <FileText className="h-10 w-10" />
                  ) : kind === "pptx" ? (
                    <Presentation className="h-10 w-10" />
                  ) : kind === "image" ? (
                    <FileImage className="h-10 w-10" />
                  ) : (
                    <FileIcon className="h-10 w-10" />
                  )}
                </div>
              )}

              <div className="p-2">
                <div className="truncate text-xs font-medium text-[var(--text-ink)]" title={f.name}>
                  {f.name}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{formatFileSize(f.size ?? null)}</span>
                  {variant === "view" && f.url && (
                    <a
                      href={f.url}
                      download={f.name}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-primary hover:bg-primary-soft/30"
                      aria-label="Татаж авах"
                      title="Татаж авах"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(f.id)
                  }}
                  className={cn(
                    "absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full",
                    "bg-white/95 text-destructive shadow-sm hover:bg-white"
                  )}
                  aria-label="Файл устгах"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <FilePreview file={preview} onClose={() => setPreview(null)} />
    </>
  )
}

function detectKind(name: string, type: string | null | undefined): "image" | "pdf" | "pptx" | "other" {
  const lower = (name || "").toLowerCase()
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".gif")) return "image"
  if (lower.endsWith(".pdf")) return "pdf"
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "pptx"
  if (type?.startsWith("image/")) return "image"
  if (type === "application/pdf") return "pdf"
  if (type?.includes("presentation")) return "pptx"
  return "other"
}
