import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "CodePilot AI - Persistent Memory Code Review Agent",
  description: "An AI-powered code reviewer that remembers your team's coding style and intelligently minimizes AI costs.",
  authors: [{ name: "Advanced Agentic Coding Team" }],
  openGraph: {
    title: "CodePilot AI",
    description: "Automated reviews with Hindsight memory & cascadeflow routing optimization.",
    type: "website"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} antialiased bg-zinc-950 text-white font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
