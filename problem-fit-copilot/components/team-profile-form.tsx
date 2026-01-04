"use client"
import { Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelectChips } from "@/components/multi-select-chips"
import { ROLE_OPTIONS, SKILL_OPTIONS, DOMAIN_OPTIONS } from "@/lib/constants"
import type { Team, TeamMember, MemberRole } from "@/lib/types"

interface TeamProfileFormProps {
  value: Team
  onChange: (team: Team) => void
}

export function TeamProfileForm({ value, onChange }: TeamProfileFormProps) {
  const addMember = () => {
    const newMember: TeamMember = {
      name: "",
      role: "frontend",
      skills: [],
      experience_years: 1,
      domains: [],
      past_project_tags: [],
    }
    onChange({
      ...value,
      members: [...value.members, newMember],
    })
  }

  const removeMember = (index: number) => {
    onChange({
      ...value,
      members: value.members.filter((_, i) => i !== index),
    })
  }

  const updateMember = (index: number, updatedMember: TeamMember) => {
    onChange({
      ...value,
      members: value.members.map((m, i) => (i === index ? updatedMember : m)),
    })
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="bg-gradient-to-br from-card to-card/60 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Team Profile</CardTitle>
            <CardDescription>Define your team's capabilities and experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="team-name">Team Name</Label>
          <Input
            id="team-name"
            placeholder="Enter your team name"
            value={value.team_name}
            onChange={(e) => onChange({ ...value, team_name: e.target.value })}
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
            <Button onClick={addMember} size="sm" variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>

          {value.members.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No team members added yet</p>
              <p className="text-sm mt-1">Click "Add Member" to get started</p>
            </div>
          )}

          {value.members.map((member, index) => (
            <Card key={index} className="bg-muted/30 border-border/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`member-name-${index}`}>Name</Label>
                      <Input
                        id={`member-name-${index}`}
                        placeholder="Member name"
                        value={member.name}
                        onChange={(e) => updateMember(index, { ...member, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`member-role-${index}`}>Role</Label>
                      <Select
                        value={member.role}
                        onValueChange={(role: MemberRole) => updateMember(index, { ...member, role })}
                      >
                        <SelectTrigger id={`member-role-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`member-experience-${index}`}>Experience (years)</Label>
                      <Input
                        id={`member-experience-${index}`}
                        type="number"
                        min="0"
                        max="50"
                        value={member.experience_years}
                        onChange={(e) =>
                          updateMember(index, { ...member, experience_years: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <MultiSelectChips
                  label="Skills"
                  value={member.skills}
                  onChange={(skills) => updateMember(index, { ...member, skills })}
                  suggestions={SKILL_OPTIONS}
                  placeholder="Add skills (e.g. React, Python, ML)"
                />

                <MultiSelectChips
                  label="Domains"
                  value={member.domains}
                  onChange={(domains) => updateMember(index, { ...member, domains })}
                  suggestions={DOMAIN_OPTIONS}
                  placeholder="Add domains (e.g. Healthcare, AI/ML)"
                />

                <MultiSelectChips
                  label="Past Project Tags"
                  value={member.past_project_tags}
                  onChange={(past_project_tags) => updateMember(index, { ...member, past_project_tags })}
                  placeholder="Add project tags (e.g. chatbot, mobile-app)"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
