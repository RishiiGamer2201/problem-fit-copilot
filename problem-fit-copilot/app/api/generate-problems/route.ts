import { streamObject } from 'ai'
import { z } from 'zod'

// Zod schema matching ProblemStatement interface
const problemStatementSchema = z.object({
  title: z.string().describe('A concise, engaging title for the hackathon problem'),
  description: z
    .string()
    .describe('Detailed description of the problem, requirements, and expected outcomes'),
  domains: z.array(z.string()).describe('Relevant domains/industries for this problem'),
  required_skills: z.array(z.string()).describe('Technical skills needed to solve this problem'),
  complexity_level: z
    .number()
    .min(1)
    .max(5)
    .describe('Complexity level from 1 (trivial) to 5 (very complex)'),
  time_risk: z.number().min(1).max(5).describe('Time risk from 1 (very low) to 5 (very high)'),
  dependencies: z.object({
    external_api: z.boolean().describe('Whether the solution requires external APIs'),
    hardware: z.boolean().describe('Whether the solution requires hardware components'),
    realtime: z.boolean().describe('Whether the solution requires real-time processing'),
  }),
})

const problemsResponseSchema = z.object({
  problems: z
    .array(problemStatementSchema)
    .min(3)
    .max(6)
    .describe('An array of 3-6 diverse problem statements tailored to the team'),
})

export async function POST(req: Request) {
  try {
    const { team } = await req.json()

    // Build context from team profile
    const teamContext = `
Team: ${team.team_name}

Team Members:
${team.members
  .map(
    (m: any) => `
- ${m.name} (${m.role}, ${m.experience_years} years exp)
  Skills: ${m.skills.join(', ')}
  Domains: ${m.domains.join(', ')}
  Past Projects: ${m.past_project_tags.join(', ')}
`,
  )
  .join('\n')}
`

    const result = streamObject({
      model: 'openai/gpt-5',
      schema: problemsResponseSchema,
      prompt: `You are an expert hackathon organizer and technical advisor. Based on the following team profile, generate 3-6 diverse, realistic problem statements that would be a great fit for this team's skills and experience.

${teamContext}

Guidelines:
- Match problems to the team's collective skillset and domains
- Ensure problems are achievable within a hackathon timeframe (24-48 hours)
- Vary complexity levels (mix of 2-4 range) to provide options
- Consider the team composition (ML/frontend/backend/hardware roles)
- Create engaging, real-world problems that showcase their strengths
- Include a mix of dependencies (some requiring APIs, some hardware, some real-time)
- Make titles catchy and descriptions clear and actionable

Generate problems that would excite this team and give them the best chance of success.`,
      maxOutputTokens: 4000,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] Error generating problems:', error)
    return Response.json({ error: 'Failed to generate problems' }, { status: 500 })
  }
}
