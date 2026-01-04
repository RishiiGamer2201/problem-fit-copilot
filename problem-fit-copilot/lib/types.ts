// Team Member Types
export type MemberRole = "ml" | "frontend" | "backend" | "hardware"

export interface TeamMember {
  name: string
  role: MemberRole
  skills: string[]
  experience_years: number
  domains: string[]
  past_project_tags: string[]
}

export interface Team {
  team_name: string
  members: TeamMember[]
}

// Problem Statement Types
export interface ProblemStatement {
  id?: string // Optional ID for client-side tracking
  title: string
  description: string
  domains: string[]
  required_skills: string[]
  complexity_level: number // 1-5
  time_risk: number // 1-5
  dependencies: {
    external_api: boolean
    hardware: boolean
    realtime: boolean
  }
}

// API Request/Response Types
export interface EvaluationRequest {
  team: Team
  problems: ProblemStatement[]
}

export interface ProblemEvaluation {
  problem_id: string
  fit_score: number // 0-100
  success_probability: number // 0-100
  explanation: {
    positives: string[]
    negatives: string[]
  }
}

export type EvaluationResponse = ProblemEvaluation[]
