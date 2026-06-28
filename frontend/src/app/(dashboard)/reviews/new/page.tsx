"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCreateReview, useReviews } from "@/hooks/useReviews"
import { useRepositories } from "@/hooks/useMemory"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Upload, Code2, PlusCircle, Terminal, FileCode, CheckCircle2, AlertCircle } from "lucide-react"
import MonacoEditor from "@monaco-editor/react"
import { Badge } from "@/components/ui/Badge"

export default function NewReviewPage() {
  const router = useRouter()
  const createReviewMutation = useCreateReview()
  const { data: repos = [] } = useRepositories()

  // Form State
  const [selectedRepoId, setSelectedRepoId] = useState<string>("none")
  const [pasteContent, setPasteContent] = useState("")
  const [pasteFilename, setPasteFilename] = useState("app.py")
  const [pasteLang, setPasteLang] = useState("python")
  const [filesList, setFilesList] = useState<Array<{ filename: string; content: string; language: string }>>([])
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    setErrorMsg(null)
    const newFiles = Array.from(e.target.files)
    
    newFiles.forEach((file) => {
      // Basic extension checks
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      const langMap: Record<string, string> = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".java": "java"
      }
      
      const lang = langMap[ext]
      if (!lang) {
        setErrorMsg(`Unsupported file type: ${file.name}. Only Python, Javascript, Typescript, and Java are supported in this demo.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setFilesList((prev) => [
          ...prev,
          { filename: file.name, content: text, language: lang }
        ])
      }
      reader.readAsText(file)
    })
  }

  const handleStartReview = async (type: "paste" | "upload") => {
    setErrorMsg(null)
    
    let submissionFiles = []
    
    if (type === "paste") {
      if (!pasteContent.trim()) {
        setErrorMsg("Please paste some code before starting the review.")
        return
      }
      submissionFiles = [
        {
          filename: pasteFilename || "app.py",
          content: pasteContent,
          language: pasteLang
        }
      ]
    } else {
      if (filesList.length === 0) {
        setErrorMsg("Please add at least one file to upload.")
        return
      }
      submissionFiles = filesList
    }

    try {
      const repo_id = selectedRepoId === "none" ? undefined : parseInt(selectedRepoId)
      
      const res = await createReviewMutation.mutateAsync({
        repo_id,
        files: submissionFiles
      })
      
      // Redirect to review detail report page
      router.push(`/reviews/${res.id}`)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit code for review.")
    }
  }

  const handleRemoveFile = (index: number) => {
    setFilesList((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">New Code Review</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Submit code blocks or upload files. Select a repository to use its Team Knowledge Graph.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 font-medium flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Configuration Card */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repository-select">Repository memory context (Optional)</Label>
            <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
              <SelectTrigger id="repository-select" className="border-zinc-800 focus:ring-violet-500">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Stateless Review)</SelectItem>
                {repos.map((r: any) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="block text-[10px] text-zinc-500">
              Linking a repository allows CodePilot AI to recall past coding preferences and update the Team Knowledge Graph.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="upload" className="gap-2 font-semibold">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="paste" className="gap-2 font-semibold">
            <Code2 className="h-4 w-4" />
            Paste Snippet
          </TabsTrigger>
        </TabsList>

        {/* Upload Files Tab */}
        <TabsContent value="upload" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900/30">
            <CardContent className="p-6 space-y-6">
              {/* Drag/Drop Box */}
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/10 px-6 py-10 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".py,.js,.jsx,.ts,.tsx,.java"
                />
                <Upload className="h-10 w-10 text-zinc-500 group-hover:text-violet-400 group-hover:scale-105 transition-all mb-3" />
                <span className="block text-sm font-semibold text-white mb-1">
                  Drag and drop files here or click to browse
                </span>
                <span className="block text-xs text-zinc-500">
                  Supports Python, JS, TS, and Java source files
                </span>
              </div>

              {/* Uploaded Files list */}
              {filesList.length > 0 && (
                <div className="space-y-2">
                  <Label>Files ready to review ({filesList.length})</Label>
                  <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-lg overflow-hidden bg-zinc-900/20">
                    {filesList.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 text-sm">
                        <div className="flex items-center space-x-2.5 text-zinc-300">
                          <FileCode className="h-4.5 w-4.5 text-zinc-500" />
                          <span className="font-medium font-mono text-xs">{f.filename}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            {f.language}
                          </Badge>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-zinc-900 pt-4 flex justify-end">
              <Button
                disabled={filesList.length === 0 || createReviewMutation.isPending}
                onClick={() => handleStartReview("upload")}
                className="gap-2 font-semibold"
              >
                {createReviewMutation.isPending ? "Submitting Review..." : "Start Code Review"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Paste Code Tab */}
        <TabsContent value="paste" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900/30">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paste-filename">Filename</Label>
                  <Input
                    id="paste-filename"
                    placeholder="main.py"
                    value={pasteFilename}
                    onChange={(e) => setPasteFilename(e.target.value)}
                    className="border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paste-language">Language</Label>
                  <Select value={pasteLang} onValueChange={setPasteLang}>
                    <SelectTrigger id="paste-language" className="border-zinc-800">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Code Content</Label>
                <div className="rounded-lg border border-zinc-850 overflow-hidden bg-[#1e1e1e]">
                  <MonacoEditor
                    height="320px"
                    language={pasteLang}
                    theme="vs-dark"
                    value={pasteContent}
                    onChange={(val) => setPasteContent(val || "")}
                    options={{
                      fontSize: 12,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      padding: { top: 8 }
                    }}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-zinc-900 pt-4 flex justify-end">
              <Button
                disabled={!pasteContent.trim() || createReviewMutation.isPending}
                onClick={() => handleStartReview("paste")}
                className="gap-2 font-semibold"
              >
                {createReviewMutation.isPending ? "Submitting Review..." : "Start Code Review"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
