"use client"

import { useState } from "react"
import { Plus, Trash2, FileText, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelectChips } from "@/components/multi-select-chips"
import { SKILL_OPTIONS, DOMAIN_OPTIONS, COMPLEXITY_LABELS, TIME_RISK_LABELS } from "@/lib/constants"
import type { ProblemStatement, Team } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProblemStatementsFormProps {
  value: ProblemStatement[]
  onChange: (problems: ProblemStatement[]) => void
  team?: Team
}

export function ProblemStatementsForm({ value, onChange, team }: ProblemStatementsFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const addProblem = () => {
    const newProblem: ProblemStatement = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      domains: [],
      required_skills: [],
      complexity_level: 3,
      time_risk: 3,
      dependencies: {
        external_api: false,
        hardware: false,
        realtime: false,
      },
    }
    onChange([...value, newProblem])
  }

  const generateWithAI = async () => {
    if (!team || team.members.length === 0) {
      setGenerationError("Please add team members first to generate relevant problems")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch("/api/generate-problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate problems")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value: chunk } = await reader.read()

        if (done) break

        buffer += decoder.decode(chunk, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const jsonStr = line.slice(2).trim()
              const parsed = JSON.parse(jsonStr)

              if (parsed.problems && Array.isArray(parsed.problems)) {
                const generatedProblems: ProblemStatement[] = parsed.problems.map((p: any) => ({
                  id: crypto.randomUUID(),
                  title: p.title,
                  description: p.description,
                  domains: p.domains || [],
                  required_skills: p.required_skills || [],
                  complexity_level: p.complexity_level || 3,
                  time_risk: p.time_risk || 3,
                  dependencies: {
                    external_api: p.dependencies?.external_api || false,
                    hardware: p.dependencies?.hardware || false,
                    realtime: p.dependencies?.realtime || false,
                  },
                }))

                onChange(generatedProblems)
              }
            } catch (e) {
              console.log("[v0] Parsing partial data, continuing...")
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error generating problems:", error)
      setGenerationError(error instanceof Error ? error.message : "Failed to generate problems. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const removeProblem = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateProblem = (index: number, updatedProblem: ProblemStatement) => {
    onChange(value.map((p, i) => (i === index ? updatedProblem : p)))
  }

  const canGenerateAI = team && team.members.length > 0

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="bg-gradient-to-br from-card to-card/60 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Problem Statements</CardTitle>
            <CardDescription>Add challenges manually or let AI generate them based on your team</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Generation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate problem statements tailored to your team's skills and experience
            </p>
          </div>
          <Button
            onClick={generateWithAI}
            disabled={!canGenerateAI || isGenerating}
            size="lg"
            className="gap-2 shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>

        {generationError && (
          <Alert variant="destructive">
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Problems to Evaluate</h3>
          <Button onClick={addProblem} size="sm" variant="outline" className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Manually
          </Button>
        </div>

        {value.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No problems added yet</p>
            <p className="text-sm mt-1">Click "Add Manually" or "Generate with AI" to get started</p>
          </div>
        )}

        {value.map((problem, index) => (
          <Card key={problem.id || index} className="bg-muted/30 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`problem-title-${index}`}>Problem Title</Label>
                    <Input
                      id={`problem-title-${index}`}
                      placeholder="e.g. Real-time Sentiment Analysis Dashboard"
                      value={problem.title}
                      onChange={(e) => updateProblem(index, { ...problem, title: e.target.value })}
                      className="font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`problem-description-${index}`}>Description</Label>
                    <Textarea
                      id={`problem-description-${index}`}
                      placeholder="Describe the problem statement, requirements, and goals..."
                      value={problem.description}
                      onChange={(e) => updateProblem(index, { ...problem, description: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProblem(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelectChips
                  label="Domains"
                  value={problem.domains}
                  onChange={(domains) => updateProblem(index, { ...problem, domains })}
                  suggestions={DOMAIN_OPTIONS}
                  placeholder="Add relevant domains"
                />

                <MultiSelectChips
                  label="Required Skills"
                  value={problem.required_skills}
                  onChange={(required_skills) => updateProblem(index, { ...problem, required_skills })}
                  suggestions={SKILL_OPTIONS}
                  placeholder="Add required skills"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Complexity Level</Label>
                    <span className="text-sm font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {COMPLEXITY_LABELS[problem.complexity_level - 1]}
                    </span>
                  </div>
                  <Slider
                    value={[problem.complexity_level]}
                    onValueChange={(val) => updateProblem(index, { ...problem, complexity_level: val[0] })}
                    min={1}
                    max={5}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Trivial</span>
                    <span>Very Complex</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Time Risk</Label>
                    <span className="text-sm font-medium px-2 py-0.5 rounded bg-accent/10 text-accent">
                      {TIME_RISK_LABELS[problem.time_risk - 1]}
                    </span>
                  </div>
                  <Slider
                    value={[problem.time_risk]}
                    onValueChange={(val) => updateProblem(index, { ...problem, time_risk: val[0] })}
                    min={1}
                    max={5}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Very High</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Dependencies</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`external-api-${index}`}
                      checked={problem.dependencies.external_api}
                      onCheckedChange={(checked) =>
                        updateProblem(index, {
                          ...problem,
                          dependencies: { ...problem.dependencies, external_api: checked === true },
                        })
                      }
                    />
                    <label
                      htmlFor={`external-api-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      External API
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`hardware-${index}`}
                      checked={problem.dependencies.hardware}
                      onCheckedChange={(checked) =>
                        updateProblem(index, {
                          ...problem,
                          dependencies: { ...problem.dependencies, hardware: checked === true },
                        })
                      }
                    />
                    <label
                      htmlFor={`hardware-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Hardware
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`realtime-${index}`}
                      checked={problem.dependencies.realtime}
                      onCheckedChange={(checked) =>
                        updateProblem(index, {
                          ...problem,
                          dependencies: { ...problem.dependencies, realtime: checked === true },
                        })
                      }
                    />
                    <label
                      htmlFor={`realtime-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Real-time
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
