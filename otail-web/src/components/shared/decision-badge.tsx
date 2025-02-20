import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Decision } from "@/types/trace"

interface DecisionBadgeProps {
  decision: Decision
  className?: string
}

export const DecisionBadge = ({ decision, className }: DecisionBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6",
        decision === Decision.Sampled
          ? "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
          : "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
        className
      )}
    >
      {Decision[decision]}
    </Badge>
  )
}
