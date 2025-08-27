import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={collapsed ? "h-7 w-7 px-0" : "h-9 w-9 px-0"}
      title={collapsed ? "Toggle theme" : undefined}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all text-foreground" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 