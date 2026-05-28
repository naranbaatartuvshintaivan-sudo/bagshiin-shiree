"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Settings, X } from "lucide-react"

import { cn, formatClassName } from "@/lib/utils"
import type { GradeWithCount } from "@/lib/supabase/types"

type SidebarProps = {
  grades: GradeWithCount[]
  open: boolean
  onClose: () => void
}

export function Sidebar({ grades, open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-primary-deep/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary-deep text-white",
          "transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">Багшийн Ширээ</div>
              <div className="text-[11px] text-white/60">Монгол хэлний багш</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden rounded-md p-1.5 text-white/80 hover:bg-white/10"
            aria-label="Хаах"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 pb-2 pt-2 text-[11px] uppercase tracking-wider text-white/50">
          Ангиуд
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-0.5">
            {grades.map((g) => {
              const href = `/grade/${g.id}`
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <li key={g.id}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "text-white/85 hover:bg-white/10"
                    )}
                  >
                    <span className="truncate">{formatClassName(g.grade, g.label)}</span>
                    <span
                      className={cn(
                        "ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                        active
                          ? "bg-white text-primary-deep"
                          : "bg-white/15 text-white"
                      )}
                    >
                      {g.lesson_count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/settings"
                ? "bg-primary text-white"
                : "text-white/85 hover:bg-white/10"
            )}
          >
            <Settings className="h-4 w-4" />
            Тохиргоо
          </Link>
        </div>
      </aside>
    </>
  )
}
