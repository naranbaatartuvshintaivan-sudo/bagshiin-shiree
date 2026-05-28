import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatClassName(grade: number, label: string | null | undefined): string {
  return label ? `${grade}-р анги ${label}` : `${grade}-р анги`
}
