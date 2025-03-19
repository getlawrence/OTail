import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleAnalytics, isAnalyticsEnabled } from "@/utils/posthog"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AnalyticsToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(isAnalyticsEnabled())
  }, [])

  const toggle = () => {
    const newState = !enabled
    setEnabled(newState)
    toggleAnalytics(newState)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8"
          >
            <BarChart3 className={`h-4 w-4 transition-colors ${enabled ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{enabled ? "Analytics are enabled. Click to disable data collection." : "Analytics are disabled. Click to enable data collection."}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 