"use client"

import { useState } from "react"
import { ArrowUpDown, TrendingUp, Award, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProblemEvaluation, ProblemStatement } from "@/lib/types"

interface EvaluationResultsProps {
  evaluations: ProblemEvaluation[]
  problems: ProblemStatement[]
}

type SortDirection = "asc" | "desc"

export function EvaluationResults({ evaluations, problems }: EvaluationResultsProps) {
  const [sortBy, setSortBy] = useState<"fit_score" | "success_probability">("fit_score")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Map evaluations with problem details
  const enrichedEvaluations = evaluations.map((evaluation) => {
    const problem = problems.find((p) => p.id === evaluation.problem_id)
    return { ...evaluation, problem }
  })

  // Sort evaluations
  const sortedEvaluations = [...enrichedEvaluations].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    return sortDirection === "desc" ? bValue - aValue : aValue - bValue
  })

  const toggleSort = (field: "fit_score" | "success_probability") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc")
    } else {
      setSortBy(field)
      setSortDirection("desc")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-blue-400"
    if (score >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20"
    if (score >= 60) return "bg-blue-500/10 border-blue-500/20"
    if (score >= 40) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="bg-gradient-to-br from-card to-card/60 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
            <Award className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Evaluation Results</CardTitle>
            <CardDescription>AI-powered analysis of team-problem fit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={sortBy === "fit_score" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("fit_score")}
            className="gap-2"
          >
            Fit Score
            <ArrowUpDown className="h-3 w-3" />
          </Button>
          <Button
            variant={sortBy === "success_probability" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("success_probability")}
            className="gap-2"
          >
            Success Probability
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-4">
          {sortedEvaluations.map((evaluation, index) => {
            const problem = evaluation.problem
            return (
              <Card key={evaluation.problem_id} className={`${getScoreBgColor(evaluation.fit_score)} border`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-background/80 border border-border/50">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(evaluation.fit_score)}`}>
                          {evaluation.fit_score}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-balance">{problem?.title || "Unknown Problem"}</h3>
                          {problem?.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{problem.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-base font-semibold px-3 py-1 whitespace-nowrap">
                          {evaluation.success_probability}% Success
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                            <TrendingUp className="h-4 w-4" />
                            Strengths
                          </div>
                          {evaluation.explanation.positives.length > 0 ? (
                            <ul className="space-y-1.5">
                              {evaluation.explanation.positives.map((positive, i) => (
                                <li key={i} className="text-sm text-foreground/90 flex gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  <span>{positive}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No strengths identified</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            Challenges
                          </div>
                          {evaluation.explanation.negatives.length > 0 ? (
                            <ul className="space-y-1.5">
                              {evaluation.explanation.negatives.map((negative, i) => (
                                <li key={i} className="text-sm text-foreground/90 flex gap-2">
                                  <span className="text-orange-400 mt-1">•</span>
                                  <span>{negative}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No challenges identified</p>
                          )}
                        </div>
                      </div>

                      {index === 0 && evaluation.fit_score >= 70 && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm font-medium text-primary">
                            <span className="font-bold">Recommended:</span> This problem is an excellent fit for your
                            team!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
