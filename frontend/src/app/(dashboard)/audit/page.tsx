"use client"

import { useState } from "react"
import { useAuditLogs, useAuditStats, useEscalations } from "@/hooks/useAudit"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { ShieldCheck, DollarSign, TrendingUp, Clock, FileCode, ArrowRight } from "lucide-react"

export default function AuditDashboardPage() {
  const [page, setPage] = useState(1)
  const { data: logsData, isLoading: logsLoading } = useAuditLogs(page, 10)
  const { data: stats, isLoading: statsLoading } = useAuditStats()
  const { data: escalations = [], isLoading: escalationsLoading } = useEscalations()

  if (statsLoading || logsLoading || escalationsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 border border-zinc-850 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const logs = logsData || []
  
  // Format model usage data
  const modelColors: Record<string, string> = {
    "llama-3.1-8b-instant": "#8b5cf6",
    "llama-3.3-70b-versatile": "#06b6d4",
  }
  
  const pieData = Object.entries(stats?.model_usage || {}).map(([name, count]) => ({
    name,
    value: count,
    fill: modelColors[name] || "#52525b"
  }))

  const statCards = [
    { label: "Total Review Costs", val: stats?.total_cost || 0, icon: DollarSign, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", prefix: "$" },
    { label: "Savings Generated", val: stats?.total_saved || 0, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", prefix: "$" },
    { label: "Escalation Count", val: stats?.escalation_count || 0, icon: TrendingUp, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Avg Latency Run", val: (stats?.avg_latency_ms || 0) / 1000, icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", suffix: "s", decimals: 1 }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="h-8 w-8 text-violet-400" />
          Audit & Costs
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Detailed metrics regarding model execution costs, tokens usage, and savings configurations.
        </p>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i} className="border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <span className="block text-2xl font-bold text-white font-mono leading-none">
                    <AnimatedCounter value={card.val} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} />
                  </span>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${card.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sankey Escalation flow & Pie Distribution split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Escalation Flow Diagram */}
        <Card className="border-zinc-800 bg-zinc-900/30 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Escalation Flow History</CardTitle>
            <CardDescription className="text-zinc-500">
              Visualizes reviews routed to Drafter first that triggered Flagship escalation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {escalations.length > 0 ? (
              <div className="space-y-3">
                {escalations.slice(0, 3).map((esc: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 gap-3 text-xs font-mono">
                    <div className="flex items-center space-x-2.5">
                      <Badge variant="secondary" className="text-[10px]">Review #{esc.review_id}</Badge>
                      <span className="text-zinc-400">{esc.initial_model}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-amber-500">
                      <ArrowRight className="h-4.5 w-4.5" />
                      <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Escalated (Conf {esc.initial_confidence.toFixed(2)})
                      </span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </div>

                    <div className="flex items-center space-x-2 text-cyan-400">
                      <span className="font-bold">{esc.final_model}</span>
                    </div>

                    <div className="text-zinc-500 text-[10px]">
                      {(esc.latency_ms / 1000).toFixed(1)}s run
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-855 rounded-xl bg-zinc-900/10">
                No confidence-based model escalations logged yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model distribution ratio chart */}
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Model Distribution</CardTitle>
            <CardDescription className="text-zinc-500">Ratio of Llama 8B vs 70B runs.</CardDescription>
          </CardHeader>
          <CardContent className="h-60 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                    itemStyle={{ fontSize: 11, color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-zinc-500 font-mono">No review logs available</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive logs table */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Model Decision Log</CardTitle>
          <CardDescription className="text-zinc-500">Auditable trace list of cascadeflow routing actions.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 font-semibold text-xs tracking-wider">
                  <th className="py-3 px-6">Review</th>
                  <th className="py-3 px-6">Complexity</th>
                  <th className="py-3 px-6">Drafter Model</th>
                  <th className="py-3 px-6">Escalated?</th>
                  <th className="py-3 px-6">Final Model</th>
                  <th className="py-3 px-6">Tokens</th>
                  <th className="py-3 px-6">Cost</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-400">
                      #{log.review_id}
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      {log.complexity_score ? `${log.complexity_score.toFixed(0)}/100` : "-"}
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-mono text-xs">{log.initial_model}</td>
                    <td className="py-4 px-6">
                      <Badge variant={log.escalated ? "warning" : "secondary"} className="uppercase text-[8px] tracking-wide">
                        {log.escalated ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-mono text-xs">{log.final_model}</td>
                    <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                      {log.tokens_input + log.tokens_output}
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      ${log.cost.toFixed(4)}
                    </td>
                    <td className="py-4 px-6 text-zinc-500 font-mono text-xs">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 text-sm">
                      No routing traces logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
