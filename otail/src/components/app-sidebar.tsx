import { Home, Settings, Telescope } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

//hide items if VITE_SHOW_SIDEBAR=false in .env 
const items = import.meta.env.VITE_SHOW_SIDEBAR === 'true'
  ? [
    {
      title: "Home",
      url: "/sampling",
      icon: Home,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Telescope,
    },
    {
      title: "config",
      url: "/otel-config",
      icon: Settings,
    },
  ]
  : [
    {
      title: "Home",
      url: "/sampling",
      icon: Home,
    },
  ];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>OTail</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}