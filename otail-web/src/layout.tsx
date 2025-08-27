import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { trackNavigation } from './utils/events';
import { useEffect } from 'react';
import { ActivePipelineBanner } from '@/components/config/ActivePipelineBanner';
import { AgentConfigBanner } from '@/components/config/AgentConfigBanner';
import { config } from '@/config';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    trackNavigation.pageView(location.pathname);
  }, [location.pathname]);

  return (
    <SidebarProvider className="flex h-screen w-screen overflow-hidden">
      <AppSidebar noBackend={config.noBackend} />
      <SidebarInset className="flex-1">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <AgentConfigBanner />
          <ActivePipelineBanner />
        </header>
        <div className="flex flex-1 flex-col w-full h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden relative">
          <PageLayout>
            <Outlet />
          </PageLayout>
          
          {/* Lawrence footer attribution */}
          <div className="absolute bottom-2 right-4 pointer-events-none">
            <a
              href="https://getlawrence.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-opacity hover:opacity-80 pointer-events-auto"
              title="Brought to you by Lawrence"
            >
              <img 
                src="/lawrence.svg" 
                alt="Lawrence" 
                className="w-4 h-4"
              />
              <span className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                Lawrence
              </span>
            </a>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}