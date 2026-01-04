"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MultiSelectChipsProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
}

export function MultiSelectChips({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  className,
}: MultiSelectChipsProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s),
  )

  const addValue = (newValue: string) => {
    const trimmed = newValue.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeValue = (toRemove: string) => {
    onChange(value.filter((v) => v !== toRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        addValue(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeValue(value[value.length - 1])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="relative">
        <div className="min-h-[42px] p-2 rounded-lg border border-input bg-background flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-ring">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1 pl-2">
              <span className="text-xs">{item}</span>
              <button
                type="button"
                onClick={() => removeValue(item)}
                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7"
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
            {filteredSuggestions.slice(0, 10).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addValue(suggestion)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
