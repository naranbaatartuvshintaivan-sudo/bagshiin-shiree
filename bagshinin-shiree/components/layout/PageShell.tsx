"use client"

import { useState } from "react"

import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import type { GradeWithCount } from "@/lib/supabase/types"

type PageShellProps = {
  grades: GradeWithCount[]
  title?: string
  children: React.ReactNode
}

export function PageShell({ grades, title, children }: PageShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar grades={grades} open={open} onClose={() => setOpen(false)} />
      <div className="md:pl-64">
        <Header title={title} onMenuClick={() => setOpen(true)} />
        <main className="px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
