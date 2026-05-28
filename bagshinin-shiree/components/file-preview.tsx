"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Download,
  ExternalLink,
  FileImage,
  FileText,
  File as FileIcon,
  Maximize,
  Minimize,
  Presentation,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type PreviewFile = {
  name: string
  url: string
  type?: string | null
}

type FilePreviewProps = {
  file: PreviewFile | null
  onClose: () => void
}

type Kind = "image" | "pdf" | "pptx" | "office" | "other"

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFs, setIsFs] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose()
      }
    }
    function onFsChange() {
      setIsFs(Boolean(document.fullscreenElement))
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("fullscreenchange", onFsChange)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("fullscreenchange", onFsChange)
    }
  }, [onClose])

  useEffect(() => {
    if (!file) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [file])

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      // browser may reject if not user-initiated; ignore silently
    }
  }, [])

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0a1f3a]/95"
          role="dialog"
          aria-modal="true"
          aria-label={file.name}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
              >
                {isFs ? (
                  <>
                    <Minimize className="h-4 w-4" />
                    Гарах
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4" />
                    Бүтэн дэлгэц
                  </>
                )}
              </button>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
                aria-label="Шинэ цонхонд нээх"
                title="Шинэ цонхонд нээх"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={file.url}
                download={file.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
                aria-label="Татаж авах"
                title="Татаж авах"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
                aria-label="Хаах"
                title="Хаах"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <PreviewBody file={file} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PreviewBody({ file }: { file: PreviewFile }) {
  const kind = detectKind(file.name, file.type)

  if (kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name}
        className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
      />
    )
  }

  if (kind === "pdf") {
    return (
      <div className="flex h-full w-full flex-col">
        <iframe
          src={file.url}
          title={file.name}
          className="h-full w-full bg-white"
        />
        <FallbackNote url={file.url} />
      </div>
    )
  }

  if (kind === "pptx" || kind === "office") {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`
    return (
      <div className="flex h-full w-full flex-col">
        <iframe
          src={officeUrl}
          title={file.name}
          className="h-full w-full bg-white"
          allowFullScreen
        />
        <FallbackNote url={file.url} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center text-white">
      <KindIcon kind={kind} className="h-16 w-16 opacity-80" />
      <div className="max-w-md break-words text-sm">{file.name}</div>
      <div className="text-xs text-white/60">
        Энэ файлын төрлийг урьдчилан харах боломжгүй.
      </div>
      <div className="flex items-center gap-2">
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Шинэ цонхонд нээх
        </a>
        <a
          href={file.url}
          download={file.name}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
        >
          <Download className="h-3.5 w-3.5" />
          Татаж авах
        </a>
      </div>
    </div>
  )
}

function FallbackNote({ url }: { url: string }) {
  return (
    <div className="shrink-0 border-t border-white/10 bg-black/40 px-4 py-2 text-center text-[11px] text-white/70">
      Файл харагдахгүй бол{" "}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline hover:text-white"
      >
        шинэ цонхонд нээх
      </a>
      .
    </div>
  )
}

function KindIcon({ kind, className }: { kind: Kind; className?: string }) {
  if (kind === "pdf") return <FileText className={className} />
  if (kind === "pptx") return <Presentation className={className} />
  if (kind === "image") return <FileImage className={className} />
  return <FileIcon className={cn(className)} />
}

export function detectKind(
  name: string,
  type: string | null | undefined
): Kind {
  const lower = (name || "").toLowerCase()
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  )
    return "image"
  if (lower.endsWith(".pdf")) return "pdf"
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "pptx"
  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx")
  )
    return "office"
  if (type?.startsWith("image/")) return "image"
  if (type === "application/pdf") return "pdf"
  if (type?.includes("presentation")) return "pptx"
  if (type?.includes("word") || type?.includes("sheet") || type?.includes("excel"))
    return "office"
  return "other"
}
