"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const KEY = "bagshiin-shiree:teacher-name"

export function TeacherNameField() {
  const [name, setName] = useState("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setName(window.localStorage.getItem(KEY) ?? "Ану багш")
    setLoaded(true)
  }, [])

  function save() {
    if (typeof window === "undefined") return
    window.localStorage.setItem(KEY, name.trim() || "Ану багш")
    toast.success("Хадгалагдлаа")
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="teacher_name">Багшийн нэр</Label>
      <div className="flex gap-2">
        <Input
          id="teacher_name"
          value={loaded ? name : ""}
          onChange={(e) => setName(e.target.value)}
          disabled={!loaded}
        />
        <button
          type="button"
          onClick={save}
          disabled={!loaded}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          Хадгалах
        </button>
      </div>
      <p className="text-xs text-ink/50">
        Зөвхөн энэ төхөөрөмжид хадгалагдана.
      </p>
    </div>
  )
}
