"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Terminal, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { useAuthStore } from "@/stores/authStore"
import { fetchAPI } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // POST demo-login
      const res = await fetchAPI("/api/auth/demo-login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim() })
      })

      // Store in auth store
      login(res.access_token, res.user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      {/* Decorative glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute top-[20%] left-[20%] h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[80px]" />
      <div className="absolute bottom-[20%] right-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[80px]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to CodePilot AI</CardTitle>
            <CardDescription className="text-zinc-400">
              Demo login bypass. Register a username to continue.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="developer_steve"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="border-zinc-800 focus-visible:ring-violet-500 pl-9"
                    required
                  />
                  <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full gap-2 font-semibold" disabled={loading}>
                {loading ? "Initializing Session..." : "Start Demo Session"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
