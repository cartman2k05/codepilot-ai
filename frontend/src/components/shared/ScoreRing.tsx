"use client"

import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number // 0 to 100
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}

export function ScoreRing({ score, size = "md", label, className }: ScoreRingProps) {
  // Dimensions based on size
  const sizes = {
    sm: { diameter: 48, strokeWidth: 4, radius: 20, fontSize: "text-xs" },
    md: { diameter: 72, strokeWidth: 5, radius: 31, fontSize: "text-sm" },
    lg: { diameter: 120, strokeWidth: 8, radius: 52, fontSize: "text-2xl font-bold" }
  }

  const { diameter, strokeWidth, radius, fontSize } = sizes[size]
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference

  // Dynamic color matching score level
  const getColor = (val: number) => {
    if (val >= 90) return "text-emerald-500 stroke-emerald-500"
    if (val >= 75) return "text-amber-500 stroke-amber-500"
    return "text-rose-500 stroke-rose-500"
  }

  const colorClass = getColor(score)

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-1.5", className)}>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg
          className="rotate-[-90deg] w-full h-full"
          viewBox={`0 0 ${diameter} ${diameter}`}
        >
          {/* Background circle */}
          <circle
            className="stroke-zinc-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
          />
          {/* Animated Foreground circle */}
          <circle
            className={cn("transition-all duration-1000 ease-out", colorClass)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            style={{
              animation: "score-grow 1s ease-out forwards"
            }}
          />
        </svg>
        {/* Score indicator text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-mono text-white", fontSize)}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-zinc-400 font-medium tracking-wide">
          {label}
        </span>
      )}
    </div>
  )
}
export default ScoreRing
