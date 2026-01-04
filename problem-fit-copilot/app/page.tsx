"use client"

import { useState } from "react"
import { Sparkles, Loader2, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TeamProfileForm } from "@/components/team-profile-form"
import { ProblemStatementsForm } from "@/components/problem-statements-form"
import { EvaluationResults } from "@/components/evaluation-results"
import { evaluateProblems } from "@/lib/api"
import type { Team, ProblemStatement, EvaluationResponse } from "@/lib/types"

export default function Home() {
  const [team, setTeam] = useState<Team>({
    team_name: "",
    members: [],
  })

  const [problems, setProblems] = useState<ProblemStatement[]>([])
  const [evaluations, setEvaluations] = useState<EvaluationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validation
    if (!team.team_name.trim()) {
      setError("Please enter a team name")
      return
    }

    if (team.members.length === 0) {
      setError("Please add at least one team member")
      return
    }

    if (problems.length === 0) {
      setError("Please add at least one problem statement")
      return
    }

    // Check that all members have names
    const missingNames = team.members.some((m) => !m.name.trim())
    if (missingNames) {
      setError("All team members must have a name")
      return
    }

    // Check that all problems have titles
    const missingTitles = problems.some((p) => !p.title.trim())
    if (missingTitles) {
      setError("All problems must have a title")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Prepare the request (remove client-side IDs from problems)
      const problemsForApi = problems.map((p) => {
        const { id, ...rest } = p
        return { ...rest, problem_id: id }
      })

      const response = await evaluateProblems({
        team,
        problems: problemsForApi as any,
      })

      setEvaluations(response)

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to evaluate problems. Please check your backend is running.",
      )
      console.error("Evaluation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = team.team_name.trim() && team.members.length > 0 && problems.length > 0 && !isLoading

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Team Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Find Your Perfect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Hackathon Problem
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Enter your team's profile and let AI generate tailored problem statements, or add them manually to get
            data-driven insights on your best fit.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Forms Section */}
        <div className="space-y-8 mb-8">
          <TeamProfileForm value={team} onChange={setTeam} />
          <ProblemStatementsForm value={problems} onChange={setProblems} team={team} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-12">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Evaluate Problems
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {evaluations && evaluations.length > 0 && (
          <div id="results" className="scroll-mt-8">
            <EvaluationResults evaluations={evaluations} problems={problems} />
          </div>
        )}

        {/* Empty State for Results */}
        {evaluations && evaluations.length === 0 && (
          <Alert className="bg-muted/50">
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>
              The evaluation completed but returned no results. Please check your backend implementation.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
