import { Telescope, LogOut, Users, Wrench, Palette, Share2, Network, Layers } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { AnalyticsToggle } from "@/components/layout/analytics-toggle"
import { Checklist } from "@/components/Checklist"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/use-auth'
import { Link, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const noAuthRequired = import.meta.env.VITE_NO_AUTH_REQUIRED === 'true'
const items = !noAuthRequired
  ? [
    {
      title: "Policy Builder",
      url: "/sampling",
      icon: Wrench,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Telescope,
    },
    {
      title: "Agent Groups",
      url: "/agent-groups",
      icon: Layers,
    },
    {
      title: "Canvas",
      url: "/canvas",
      icon: Palette,
    },
    {
      title: "Pipelines",
      url: "/pipelines",
      icon: Share2,
      badge: "New"
    },
    {
      title: "Deployments",
      url: "/deployments",
      icon: Network,
    },
    {
      title: "Organization",
      url: "/organization",
      icon: Users,
    },
  ]
  : [
    {
      title: "Policy Builder",
      url: "/sampling",
      icon: Wrench,
    },
    {
      title: "Canvas",
      url: "/canvas",
      icon: Palette,
    },
    {
      title: "Agent Groups",
      url: "/agent-groups",
      icon: Layers,
    },
    {
      title: "Pipelines",
      url: "/pipelines",
      icon: Share2,
      badge: "New"
    },
    {
      title: "Deployments",
      url: "/deployments",
      icon: Network,
    },
  ];

export function AppSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="flex flex-col h-full">
        <div className="flex items-center px-6 py-4 mb-2">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Telescope className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">OTail</h2>
          </Link>
        </div>

        <SidebarGroup className="px-2 flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                          isActive
                            ? "bg-muted text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-primary"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 pb-4 border-border">
          <Checklist />
        </div>

        <div className="mt-auto border-t border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <AnalyticsToggle />
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/organization" className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Organization</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}