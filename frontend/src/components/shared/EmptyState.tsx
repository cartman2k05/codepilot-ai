import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-zinc-600">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mb-6 max-w-sm text-sm text-zinc-400">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
export default EmptyState
