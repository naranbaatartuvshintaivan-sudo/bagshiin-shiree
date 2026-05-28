"use client"

import { Menu } from "lucide-react"

type HeaderProps = {
  title?: string
  onMenuClick: () => void
}

export function Header({ title = "Багшийн Ширээ", onMenuClick }: HeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-primary-soft/40 bg-white px-3">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-primary-deep hover:bg-primary-soft/40"
        aria-label="Цэс нээх"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="text-base font-semibold text-primary-deep truncate">
        {title}
      </div>
    </header>
  )
}
