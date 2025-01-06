import { User } from '@/api/types';
import * as authApi from '@/api/auth';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, organization: string) => Promise<void>;
  logout: () => void;
  switchOrganization: (organizationId: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // If user has organizations but no current organization, set the first one as current
        if (parsedUser.organizations?.length > 0 && !parsedUser.current_organization) {
          switchOrganization(parsedUser.organizations[0].id).catch(console.error);
        } else {
          setUser(parsedUser);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    try {
      const organization = await authApi.switchOrganization(organizationId);

      const updatedUser = {
        ...user,
        current_organization: organization,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Refresh the page to update all data for the new organization
      window.location.reload();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to switch organization');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const organization = await authApi.login(email, password);

      localStorage.setItem('api_token', organization.api_token);
      localStorage.setItem('user', JSON.stringify(organization.user));
      setUser(organization.user);
      navigate('/');
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, organization: string) => {
    try {
      const data = await authApi.register(email, password, organization);

      localStorage.setItem('api_token', data.api_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        switchOrganization,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
