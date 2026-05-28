import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Багшийн Ширээ",
  description: "Хичээлээ нэг газар",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink font-sans">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
