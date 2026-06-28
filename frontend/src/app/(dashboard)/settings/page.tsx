"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/Dialog"
import { Settings, ShieldAlert, CheckCircle2, User, Key, Sliders, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuthStore()

  // Setting States
  const [budget, setBudget] = useState("10.00")
  const [threshold, setThreshold] = useState("0.80")
  const [useCascade, setUseCascade] = useState(true)
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setSuccess(false)
    setTimeout(() => {
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="h-8 w-8 text-violet-400" />
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure runtime intelligence thresholds and memory retention parameters.
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-medium flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Account Profile Card */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader className="flex flex-row items-center space-x-3 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">User Session Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="block text-zinc-500 text-xs">Username</span>
              <span className="font-semibold text-white">{user?.username || "developer_steve"}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-zinc-500 text-xs">Email Address</span>
              <span className="font-semibold text-white">{user?.email || "steve@codepilot.demo"}</span>
            </div>
            <div className="space-y-1 col-span-2">
              <span className="block text-zinc-500 text-xs">Session Token (JWT)</span>
              <span className="font-mono text-xs text-zinc-400 truncate block max-w-lg">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cascadeflow Routing preferences */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader className="flex flex-row items-center space-x-3 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Cascadeflow Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Use cascadeflow switch toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="cascade-toggle" className="text-white text-sm font-bold">Model Cascading</Label>
              <span className="block text-xs text-zinc-500">
                Route reviews dynamically across Llama 8B and 70B models.
              </span>
            </div>
            <Switch
              id="cascade-toggle"
              checked={useCascade}
              onCheckedChange={setUseCascade}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Escalation confidence threshold */}
            <div className="space-y-2">
              <Label htmlFor="escalate-threshold">Confidence Threshold</Label>
              <Input
                id="escalate-threshold"
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={!useCascade}
                className="border-zinc-800"
              />
              <span className="block text-[10px] text-zinc-550">
                Escalate if drafter confidence falls below this level. Default: 0.80
              </span>
            </div>

            {/* Monthly Budget limit */}
            <div className="space-y-2">
              <Label htmlFor="budget-limit">Monthly Limit ($)</Label>
              <Input
                id="budget-limit"
                type="number"
                step="1.00"
                min="1.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="border-zinc-800"
              />
              <span className="block text-[10px] text-zinc-550">
                Max allowable API spends caps prior to forcing Drafter usage.
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-900 pt-4 flex justify-between">
          <span className="text-xs text-zinc-500">
            Cascadeflow runtime checks run locally in FastAPI context.
          </span>
          <Button onClick={handleSave} disabled={saving} className="font-semibold">
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone: Memory Reset */}
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardHeader className="flex flex-row items-center space-x-3 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-sm font-bold text-white">Reset Hindsight Memory</span>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Permanently wipes learned coding styling rules and avoided patterns. This action is irreversible.
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="font-semibold bg-rose-700 hover:bg-rose-600">
                Reset Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Are you absolutely sure?
                </DialogTitle>
                <DialogDescription className="text-zinc-500 mt-2">
                  This will purge all vector memory banks and Team Knowledge Graph profiles. AI reviews will revert back to default stateless rules.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="border-zinc-800 text-zinc-400">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" className="bg-rose-700 hover:bg-rose-600">Wipe All Memory</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
