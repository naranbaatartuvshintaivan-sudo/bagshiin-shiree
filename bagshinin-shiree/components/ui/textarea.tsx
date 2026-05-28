import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-lg border border-primary-soft/60 bg-white px-3 py-2 text-sm text-ink",
        "placeholder:text-ink/40",
        "transition-colors duration-200",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
