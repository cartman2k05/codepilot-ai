"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileCode,
  PlusCircle,
  Brain,
  Network,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Reviews", href: "/reviews", icon: FileCode },
    { label: "New Review", href: "/reviews/new", icon: PlusCircle },
    { label: "Memory Timeline", href: "/memory", icon: Brain },
    { label: "Knowledge Graph", href: "/knowledge", icon: Network },
    { label: "Audit & Costs", href: "/audit", icon: ShieldCheck },
    { label: "Settings", href: "/settings", icon: Settings }
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-zinc-900">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide">CodePilot AI</span>
            <span className="block text-[9px] text-zinc-500 font-mono leading-none">Persistent Memory Reviewer</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/") && item.href !== "/dashboard"
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-violet-500/10"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg"}
              alt="Avatar"
              className="h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900"
            />
            <div className="truncate">
              <span className="block text-sm font-medium text-white truncate max-w-[120px]">
                {user?.username || "Demo Developer"}
              </span>
              <span className="block text-xs text-zinc-500 truncate max-w-[120px]">
                {user?.email || "dev@codepilot.demo"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-rose-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
