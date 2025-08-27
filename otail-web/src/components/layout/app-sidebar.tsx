import { Telescope, LogOut, Users, Wrench, Palette, Share2 } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { AnalyticsToggle } from "@/components/layout/analytics-toggle"
import { Checklist } from "@/components/checklist/Checklist"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
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

interface AppSidebarProps {
  noBackend?: boolean;
}

export function AppSidebar({ noBackend = false }: AppSidebarProps) {
  const { logout, user } = useAuth()
  const location = useLocation()
  const { state } = useSidebar()

  const items = !noBackend
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
        title: "Pipelines",
        url: "/pipelines",
        icon: Share2,
        badge: "New"
      },
    ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border h-16 flex items-center justify-center relative">
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "collapsed" ? (
              <div className="relative group">
                <div className="flex items-center justify-center h-8 w-8 rounded-md transition-colors group-hover:opacity-0">
                  <Telescope className="h-4 w-4 text-primary" />
                </div>
                <SidebarTrigger className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <SidebarMenuButton asChild>
                <Link to="/" className="flex items-center space-x-2">
                  <Telescope className="h-4 w-4 text-primary" />
                  <span>OTail</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        {state === "expanded" && (
          <SidebarTrigger className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" />
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="px-2 flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
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
                          {state === "expanded" && <span>{item.title}</span>}
                        </span>
                        {state === "expanded" && item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {state === "collapsed" && item.badge && (
                          <div className="absolute top-0.5 right-0.5 h-3 w-3 bg-primary text-white rounded-full flex items-center justify-center min-w-[12px] text-[8px] font-medium">
                            {item.badge}
                          </div>
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
          <Checklist mode={state === "expanded" ? "full" : "compact"} />
        </div>

        <div className="mt-auto border-t border-border">
          <div className={cn(
            "py-3",
            state === "expanded" ? "px-4" : "px-2"
          )}>
            <div className={cn(
              "flex items-center",
              state === "expanded" ? "justify-between" : "justify-center flex-col gap-2"
            )}>
              <ThemeToggle collapsed={state === "collapsed"} />
              <div className={cn(
                "flex items-center",
                state === "expanded" ? "gap-2" : "gap-1 flex-col"
              )}>
                <AnalyticsToggle collapsed={state === "collapsed"} />
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "relative rounded-full",
                          state === "expanded" ? "h-8 w-8" : "h-7 w-7"
                        )}
                        title={state === "collapsed" ? user.email : undefined}
                      >
                        <Avatar className={cn(
                          state === "expanded" ? "h-8 w-8" : "h-7 w-7"
                        )}>
                          <AvatarFallback className="text-xs">
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