'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  inputClassName?: string
  className?: string
}

const EditableText = React.forwardRef<HTMLSpanElement, EditableTextProps>(
  ({ className, value, onChange, inputClassName, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false)
    const [isHovered, setIsHovered] = React.useState(false)
    const [localValue, setLocalValue] = React.useState(value)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handleClick = () => {
      setIsEditing(true)
      // Focus the input on next tick after it's rendered
      setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleBlur = () => {
      setIsEditing(false)
      if (localValue !== value) {
        onChange(localValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        setIsEditing(false)
        onChange(localValue)
      }
      if (e.key === 'Escape') {
        setIsEditing(false)
        setLocalValue(value)
      }
    }

    return (
      <div 
        className={cn("relative inline-block group", className)} 
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              inputClassName
            )}
          />
        ) : (
          <span
            ref={ref}
            onClick={handleClick}
            className={cn(
              "cursor-pointer inline-block px-3 py-1 rounded relative",
              isHovered && "bg-accent/50",
              "after:content-['✎'] after:ml-2 after:opacity-0 group-hover:after:opacity-50",
              inputClassName
            )}
          >
            {value}
          </span>
        )}
      </div>
    )
  }
)

EditableText.displayName = "EditableText"

export { EditableText }
export type { EditableTextProps }
