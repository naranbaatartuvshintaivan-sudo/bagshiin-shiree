"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import type { Activity, ListItem } from "@/lib/supabase/types"

import { PlayerEmpty } from "./PlayerShell"

const PALETTE = ["#0091b9", "#004e9b", "#ff6500", "#0a7d96", "#1e6fc0", "#e85d00"]

export function SpinWheelPlayer({ activity }: { activity: Activity }) {
  const items = useMemo(
    () => (activity.content.items ?? []).filter((i) => i.text.trim()),
    [activity]
  )

  if (items.length < 2) return <PlayerEmpty activityId={activity.id} />

  return <Wheel items={items} />
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function slicePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0)
  const p1 = polar(cx, cy, r, a1)
  const largeArc = a1 - a0 > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`
}

function Wheel({ items }: { items: ListItem[] }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState<ListItem | null>(null)

  const seg = 360 / items.length
  const cx = 100
  const cy = 100
  const r = 96

  function spin() {
    if (spinning) return
    setSpinning(true)
    setSelected(null)
    const k = Math.floor(Math.random() * items.length)
    const turns = 4 + Math.floor(Math.random() * 3)
    const center = k * seg + seg / 2
    // Одоогийн эргэлтээс цааш бүхэл эргэлт нэмж, k-р хэсгийг дээд заагч дээр зогсооно.
    const base = Math.ceil(rotation / 360) * 360
    const target = base + turns * 360 + (360 - center)
    setRotation(target)
    window.setTimeout(() => {
      setSelected(items[k])
      setSpinning(false)
    }, 3200)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative aspect-square w-full max-w-sm">
        {/* Дээд заагч */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-accent-orange drop-shadow" />
        </div>
        <motion.svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          animate={{ rotate: rotation }}
          transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {items.map((item, i) => {
            const a0 = i * seg
            const a1 = (i + 1) * seg
            const mid = a0 + seg / 2
            const labelPos = polar(cx, cy, r * 0.62, mid)
            return (
              <g key={item.id}>
                <path
                  d={slicePath(cx, cy, r, a0, a1)}
                  fill={PALETTE[i % PALETTE.length]}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid} ${labelPos.x} ${labelPos.y})`}
                >
                  {item.text.length > 12
                    ? item.text.slice(0, 11) + "…"
                    : item.text}
                </text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r="10" fill="#ffffff" stroke="#004e9b" strokeWidth="2" />
        </motion.svg>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl bg-primary-soft px-5 py-3 text-center"
        >
          <div className="text-xs font-medium text-primary-deep/70">
            Сонгогдсон
          </div>
          <div className="text-xl font-bold text-primary-deep">
            {selected.text}
          </div>
        </motion.div>
      )}

      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className="inline-flex items-center gap-2 rounded-full bg-accent-orange px-8 py-3 text-base font-bold text-white shadow-lg shadow-accent-orange/30 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {spinning ? "Эргэж байна..." : "Эргүүлэх"}
      </button>
    </div>
  )
}
