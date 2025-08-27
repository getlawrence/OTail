import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './app-sidebar';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/hooks/use-theme';
import { ChecklistProvider } from '@/contexts/ChecklistContext';

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/AppSidebar',
  component: AppSidebar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <ChecklistProvider>
              <SidebarProvider defaultOpen={true}>
                <div className="h-screen">
                  <Story />
                </div>
              </SidebarProvider>
            </ChecklistProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {
  args: {
    noBackend: false,
  },
};

export const NoBackend: Story = {
  args: {
    noBackend: true,
  },
};

export const Authenticated: Story = {
  args: {
    noBackend: false,
  },
  parameters: {
    mockAuth: {
      isAuthenticated: true,
      user: {
        email: 'user@example.com',
      },
    },
  },
};

export const Unauthenticated: Story = {
  args: {
    noBackend: false,
  },
  parameters: {
    mockAuth: {
      isAuthenticated: false,
      user: null,
    },
  },
}; 