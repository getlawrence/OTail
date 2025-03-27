import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { trackNavigation } from './utils/analytics';
import { useEffect } from 'react';
import { ActivePipelineBanner } from '@/components/config/ActivePipelineBanner';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    trackNavigation.pageView(location.pathname);
  }, [location.pathname]);

  return (
    <SidebarProvider className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <ActivePipelineBanner />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 w-full h-[calc(100vh-4rem)] min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}