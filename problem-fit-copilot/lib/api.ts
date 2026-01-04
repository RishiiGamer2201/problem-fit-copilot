import type { EvaluationRequest, EvaluationResponse } from "./types"

const API_BASE_URL = "http://localhost:8000"

export async function evaluateProblems(request: EvaluationRequest): Promise<EvaluationResponse> {
  const response = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`)
  }

  return response.json()
}
