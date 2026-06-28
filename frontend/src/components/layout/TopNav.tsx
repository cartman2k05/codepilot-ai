"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { Sparkles, Terminal } from "lucide-react"

export function TopNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Format breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean)
    if (paths.length === 0) return "Home"
    return paths
      .map((path) => path.charAt(0).toUpperCase() + path.slice(1).replace("-", " "))
      .join("  /  ")
  }

  return (
    <header className="fixed top-0 right-0 left-72 z-10 flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/50 px-8 backdrop-blur-md">
      {/* Page Title / Breadcrumb */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
          {getBreadcrumbs()}
        </span>
      </div>

      {/* Top action details */}
      <div className="flex items-center space-x-4">
        {/* Quick info badges */}
        <div className="hidden items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3.5 py-1 text-xs font-mono text-zinc-400 sm:flex">
          <Terminal className="mr-1.5 h-3.5 w-3.5 text-violet-400" />
          <span>API Connection: Connected</span>
        </div>
        
        <div className="flex items-center space-x-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 border border-violet-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Demo Account</span>
        </div>
      </div>
    </header>
  )
}
export default TopNav
