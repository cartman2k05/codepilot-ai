"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Brain, Zap, ShieldCheck, ArrowRight, Code2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/stores/authStore"

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white flex flex-col justify-between">
      {/* Decorative background grid and ambient glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
      
      <div className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Top Navbar */}
      <header className="relative z-10 flex h-20 items-center justify-between px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-wide text-lg">CodePilot AI</span>
        </div>
        <Link href={isAuthenticated ? "/dashboard" : "/login"}>
          <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:text-white">
            {isAuthenticated ? "Enter Dashboard" : "Sign In"}
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Tag / Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-400 mb-6"
          >
            <Code2 className="h-4 w-4" />
            <span>Hindsight + cascadeflow Integration</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            An AI Code Reviewer That{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Remembers
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Saves
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
          >
            CodePilot AI builds structured repository profiles to align reviews with your team's style, while dynamically optimizing model routing to cut cost.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button size="lg" className="px-8 font-semibold gap-2">
                Start Demo Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-zinc-800 text-zinc-300 hover:text-white px-8">
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            id="features"
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
          >
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md hover:scale-[1.03] transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 mb-4 border border-violet-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Persistent Memory</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Powered by Hindsight. Learns from accepted and rejected reviews to form a dynamic Team Knowledge Graph profile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md hover:scale-[1.03] transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Runtime Routing</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Powered by cascadeflow. Analyzes code complexity to start reviews on cheap Llama 8B, only escalating to 70B when confidence drops.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md hover:scale-[1.03] transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Deep Security Scan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Executes static analysis engines (Semgrep) prior to LLM compilation, merging patterns to build scored metrics.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-zinc-900 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} CodePilot AI. Built for the Persistent Memory & Runtime Intelligence AI Hackathon.
      </footer>
    </div>
  )
}
