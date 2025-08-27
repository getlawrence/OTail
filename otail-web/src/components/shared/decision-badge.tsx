import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Decision } from "@/types/trace"

interface DecisionBadgeProps {
  decision: Decision
  className?: string
}

export const DecisionBadge = ({ decision, className }: DecisionBadgeProps) => {
  const getBadgeStyle = () => {
    switch (decision) {
      case Decision.Sampled:
        return "border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500";
      case Decision.Dropped:
        return "border-orange-500/50 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500";
      default:
        return "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6",
        getBadgeStyle(),
        className
      )}
    >
      {Decision[decision]}
    </Badge>
  )
}
