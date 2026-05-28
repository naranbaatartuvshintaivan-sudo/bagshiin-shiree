"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Download, Plus, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

import { cn } from "@/lib/utils"
import { saveGradebook } from "@/lib/supabase/gradebook"
import type {
  GradeColumn,
  GradeColumnType,
  GradeRow,
  Gradebook,
} from "@/lib/supabase/types"

type Props = {
  gradebook: Gradebook
  className: string
}

type SaveState = "idle" | "saving" | "saved"

const ATTENDANCE_CYCLE = ["", "✓", "✗", "Ч"] as const

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function GradeTable({ gradebook, className }: Props) {
  const [columns, setColumns] = useState<GradeColumn[]>(gradebook.columns ?? [])
  const [rows, setRows] = useState<GradeRow[]>(gradebook.rows ?? [])
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const firstRender = useRef(true)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const persist = useDebouncedCallback(
    async (cols: GradeColumn[], rws: GradeRow[]) => {
      setSaveState("saving")
      try {
        await saveGradebook(gradebook.id, cols, rws)
        setSaveState("saved")
      } catch (err) {
        setSaveState("idle")
        toast.error(err instanceof Error ? err.message : "Хадгалах үед алдаа.")
      }
    },
    1500
  )

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    persist(columns, rows)
  }, [columns, rows, persist])

  const addColumn = useCallback(() => {
    const name = window.prompt("Шинэ баганын нэр (жишээ: I улирал)")?.trim()
    if (!name) return
    const typeRaw = window.prompt(
      "Багана төрөл: number | text | attendance",
      "number"
    )?.trim().toLowerCase()
    const type: GradeColumnType =
      typeRaw === "text"
        ? "text"
        : typeRaw === "attendance"
          ? "attendance"
          : "number"
    setColumns((c) => [...c, { id: uid(), name, type }])
  }, [])

  const addRow = useCallback(() => {
    const name = window.prompt("Сурагчийн нэр")?.trim()
    if (!name) return
    setRows((r) => [...r, { id: uid(), name, cells: {} }])
  }, [])

  const deleteColumn = useCallback((colId: string) => {
    if (!confirm("Энэ баганыг устгах уу?")) return
    setColumns((c) => c.filter((col) => col.id !== colId))
    setRows((r) =>
      r.map((row) => {
        if (!(colId in row.cells)) return row
        const next = { ...row.cells }
        delete next[colId]
        return { ...row, cells: next }
      })
    )
  }, [])

  const deleteRow = useCallback((rowId: string) => {
    if (!confirm("Энэ мөрийг устгах уу?")) return
    setRows((r) => r.filter((row) => row.id !== rowId))
  }, [])

  const updateRowName = useCallback((rowId: string, name: string) => {
    setRows((r) => r.map((row) => (row.id === rowId ? { ...row, name } : row)))
  }, [])

  const updateCell = useCallback(
    (rowId: string, colId: string, value: string | number | null) => {
      setRows((r) =>
        r.map((row) =>
          row.id === rowId
            ? { ...row, cells: { ...row.cells, [colId]: value } }
            : row
        )
      )
    },
    []
  )

  const cycleAttendance = useCallback(
    (rowId: string, colId: string) => {
      const current = String(
        rows.find((r) => r.id === rowId)?.cells[colId] ?? ""
      )
      const idx = ATTENDANCE_CYCLE.findIndex((v) => v === current)
      const next = ATTENDANCE_CYCLE[(idx + 1) % ATTENDANCE_CYCLE.length]
      updateCell(rowId, colId, next || null)
    },
    [rows, updateCell]
  )

  const averages = useMemo(() => {
    const map: Record<string, string> = {}
    for (const col of columns) {
      if (col.type !== "number") continue
      const vals: number[] = []
      for (const row of rows) {
        const raw = row.cells[col.id]
        const n = typeof raw === "number" ? raw : Number(raw)
        if (Number.isFinite(n) && raw !== "" && raw !== null) vals.push(n)
      }
      if (vals.length === 0) {
        map[col.id] = "—"
      } else {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length
        map[col.id] = avg.toFixed(1)
      }
    }
    return map
  }, [columns, rows])

  async function handleImport(file: File) {
    try {
      const XLSX = await import("xlsx")
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      if (!ws) throw new Error("Хуудас олдсонгүй")
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
        defval: null,
      })
      if (aoa.length === 0) throw new Error("Excel хоосон байна")
      const [header, ...body] = aoa
      const headerArr = (header as unknown[]).map((h) =>
        h == null ? "" : String(h).trim()
      )
      if (headerArr.length < 2) {
        throw new Error("Эхний мөр нь толгой, эхний багана нь нэр байх ёстой")
      }
      const newCols: GradeColumn[] = headerArr.slice(1).map((name, i) => ({
        id: uid(),
        name: name || `Багана ${i + 1}`,
        type: "number",
      }))
      const newRows: GradeRow[] = body
        .filter((row) => Array.isArray(row) && row.some((v) => v !== null && v !== ""))
        .map((row) => {
          const arr = row as unknown[]
          const name = arr[0] == null ? "" : String(arr[0]).trim()
          const cells: Record<string, string | number | null> = {}
          newCols.forEach((c, i) => {
            const raw = arr[i + 1]
            if (raw === null || raw === undefined || raw === "") {
              cells[c.id] = null
            } else if (typeof raw === "number") {
              cells[c.id] = raw
            } else {
              const n = Number(raw)
              cells[c.id] = Number.isFinite(n) ? n : String(raw)
            }
          })
          return { id: uid(), name, cells }
        })
      setColumns(newCols)
      setRows(newRows)
      toast.success("Excel оруулагдлаа")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel унших үед алдаа.")
    }
  }

  async function handleExport() {
    try {
      const XLSX = await import("xlsx")
      const header = ["Сурагчийн нэр", ...columns.map((c) => c.name)]
      const body = rows.map((r) => [
        r.name,
        ...columns.map((c) => {
          const v = r.cells[c.id]
          return v === undefined || v === null ? "" : v
        }),
      ])
      const aoa = [header, ...body]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Дүн")
      XLSX.writeFile(wb, `${className}-дүн.xlsx`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel татах үед алдаа.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Багана нэмэх
        </button>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Сурагч нэмэх
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-medium text-primary-deep dark:text-primary-soft hover:bg-primary-soft/30 dark:hover:bg-primary-soft/10"
        >
          <Upload className="h-3.5 w-3.5" />
          Excel оруулах
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.target.value = ""
          }}
        />
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs font-medium text-primary-deep dark:text-primary-soft hover:bg-primary-soft/30 dark:hover:bg-primary-soft/10"
        >
          <Download className="h-3.5 w-3.5" />
          Excel татах
        </button>
        <div className="ml-auto text-xs text-[var(--text-muted)]">
          {saveState === "saving" && "Хадгалж байна..."}
          {saveState === "saved" && "Хадгалагдсан ✓"}
        </div>
      </div>

      {columns.length === 0 && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--text-muted)]">
          Багана болон сурагч нэмж эхлээрэй.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)]">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-10 border-b border-r border-[var(--border-soft)] bg-primary-soft/30 px-3 py-2 text-left font-semibold text-primary-deep"
                  style={{ minWidth: 180 }}
                >
                  Сурагчийн нэр
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="border-b border-r border-[var(--border-soft)] bg-primary-soft/30 px-3 py-2 text-left font-semibold text-primary-deep"
                    style={{ minWidth: 110 }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={col.name}>
                        {col.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteColumn(col.id)}
                        className="rounded p-0.5 text-primary-deep/60 hover:bg-primary-deep/10 hover:text-destructive"
                        aria-label="Багана устгах"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-0.5 text-[10px] font-normal uppercase tracking-wide text-primary-deep/60">
                      {col.type === "number"
                        ? "Тоо"
                        : col.type === "text"
                          ? "Бичвэр"
                          : "Ирц"}
                    </div>
                  </th>
                ))}
                <th className="border-b border-[var(--border-soft)] bg-primary-soft/30 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-primary-soft/10">
                  <td
                    className="sticky left-0 z-10 border-b border-r border-[var(--border-soft)] bg-[var(--card-bg)] px-2 py-1"
                  >
                    <input
                      value={row.name}
                      onChange={(e) => updateRowName(row.id, e.target.value)}
                      className="w-full bg-transparent px-1 py-0.5 text-sm text-[var(--text-ink)] outline-none focus:bg-primary-soft/20"
                    />
                  </td>
                  {columns.map((col) => (
                    <Cell
                      key={col.id}
                      col={col}
                      value={row.cells[col.id] ?? ""}
                      onChange={(v) => updateCell(row.id, col.id, v)}
                      onCycleAttendance={() => cycleAttendance(row.id, col.id)}
                    />
                  ))}
                  <td className="border-b border-[var(--border-soft)] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="rounded p-1 text-[var(--text-muted)] hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Мөр устгах"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length > 0 && columns.some((c) => c.type === "number") && (
                <tr>
                  <td
                    className="sticky left-0 z-10 border-t border-r border-[var(--border-soft)] bg-primary-soft/20 px-3 py-2 text-sm font-semibold text-primary-deep"
                  >
                    Дундаж
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className="border-t border-r border-[var(--border-soft)] bg-primary-soft/20 px-3 py-2 text-right text-sm font-semibold text-primary-deep tabular-nums"
                    >
                      {col.type === "number" ? averages[col.id] ?? "—" : ""}
                    </td>
                  ))}
                  <td className="border-t border-[var(--border-soft)] bg-primary-soft/20" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Cell({
  col,
  value,
  onChange,
  onCycleAttendance,
}: {
  col: GradeColumn
  value: string | number
  onChange: (v: string | number | null) => void
  onCycleAttendance: () => void
}) {
  if (col.type === "attendance") {
    const v = String(value ?? "")
    const color =
      v === "✓"
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
        : v === "✗"
          ? "bg-destructive/15 text-destructive"
          : v === "Ч"
            ? "bg-accent-yellow/30 text-primary-deep dark:text-accent-yellow"
            : "text-[var(--text-muted)]"
    return (
      <td className="border-b border-r border-[var(--border-soft)] p-0">
        <button
          type="button"
          onClick={onCycleAttendance}
          className={cn(
            "block h-9 w-full text-center text-base font-semibold transition-colors",
            color
          )}
        >
          {v || "–"}
        </button>
      </td>
    )
  }

  if (col.type === "number") {
    return (
      <td className="border-b border-r border-[var(--border-soft)] p-0">
        <input
          inputMode="decimal"
          value={value === null ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === "") return onChange(null)
            const n = Number(raw)
            onChange(Number.isFinite(n) ? n : raw)
          }}
          className="h-9 w-full bg-transparent px-2 text-right text-sm tabular-nums text-[var(--text-ink)] outline-none focus:bg-primary-soft/20"
        />
      </td>
    )
  }

  return (
    <td className="border-b border-r border-[var(--border-soft)] p-0">
      <input
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-9 w-full bg-transparent px-2 text-sm text-[var(--text-ink)] outline-none focus:bg-primary-soft/20"
      />
    </td>
  )
}
