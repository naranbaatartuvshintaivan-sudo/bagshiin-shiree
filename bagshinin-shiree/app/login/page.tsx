"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"

const USERNAME_TO_EMAIL: Record<string, string> = {
  sersmaa: "bagsh@teacher-desk.local",
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("Sersmaa")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const email = USERNAME_TO_EMAIL[username.toLowerCase().trim()]
      if (!email) {
        toast.error("Нэвтрэх нэр буруу байна")
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error("Нэвтрэх нэр эсвэл нууц үг буруу")
        return
      }
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-paper)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-deep text-white mb-4">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-primary-deep">Багшийн Ширээ</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Монгол хэлний багш</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] p-6 space-y-4 shadow-sm"
        >
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-[var(--text-ink)]">
              Нэвтрэх нэр
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-muted)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-ink)]">
              Нууц үг
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 pr-10 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-muted)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent-orange py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </div>
  )
}
