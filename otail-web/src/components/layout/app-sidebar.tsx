import { Home, Settings, Telescope, LogOut, Building } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
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
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

//hide items if VITE_SHOW_SIDEBAR=false in .env 
const noAuthRequired = import.meta.env.VITE_NO_AUTH_REQUIRED === 'true'
const items = !noAuthRequired
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
  const { logout, user, switchOrganization } = useAuth()

  const handleOrganizationChange = (organizationId: string) => {
    switchOrganization(organizationId).catch(console.error);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>OTail</SidebarGroupLabel>
          {user?.organizations && user.organizations.length > 0 && (
            <div className="px-4 py-2">
              <Select
                value={user.current_organization?.id}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger className="w-full">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {user.organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} {org.role === 'admin' && '(Admin)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user && <nav className="grid items-start px-4 text-sm font-medium mt-auto">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          {user && (
            <div className="text-sm text-gray-500 mt-2 px-3">
              {user.email}
              {user.current_organization && (
                <div className="text-xs mt-1">
                  {user.current_organization.name}
                </div>
              )}
            </div>
          )}
        </nav>}
      </SidebarContent>
      <SidebarFooter className="px-2">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}