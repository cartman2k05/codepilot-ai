"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  // Redirect to landing if not authenticated
  useEffect(() => {
    // Check if token exists in localStorage as a fallback
    const localToken = localStorage.getItem("codepilot_token")
    if (!isAuthenticated && !localToken) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("codepilot_token")) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-500 text-sm font-mono animate-pulse">Redirecting...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Fixed Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        {/* Fixed Top header */}
        <TopNav />
        
        {/* Main nested route page */}
        <main className="flex-1 pt-16 px-8 py-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
