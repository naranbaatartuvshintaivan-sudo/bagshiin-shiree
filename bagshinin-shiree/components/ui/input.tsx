import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-primary-soft/60 bg-white px-3 py-2 text-sm text-ink",
        "placeholder:text-ink/40",
        "transition-colors duration-200",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
