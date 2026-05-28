"use client"

import { FileText, FileImage, Presentation, Download, File as FileIcon, X } from "lucide-react"

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
  if (files.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {files.map((f) => {
        const kind = detectKind(f.name, f.type)
        return (
          <div
            key={f.id}
            className="group relative overflow-hidden rounded-xl border border-primary-soft/50 bg-white"
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
              <div className="truncate text-xs font-medium text-ink" title={f.name}>
                {f.name}
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[11px] text-ink/50">
                <span>{formatFileSize(f.size ?? null)}</span>
                {variant === "view" && f.url && (
                  <a
                    href={f.url}
                    download={f.name}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-primary hover:bg-primary-soft/30"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(f.id)}
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
