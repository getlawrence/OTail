import { User, RegisterParams, Organization } from '@/api/types';
import { authApi } from '@/api/auth';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (email: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (token) {
      const userData = localStorage.getItem('user');
      const orgData = localStorage.getItem('organization');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
      if (orgData) {
        const parsedOrg = JSON.parse(orgData);
        setOrganization(parsedOrg);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await authApi.login(email, password);
      localStorage.setItem('api_token', loginResponse.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      localStorage.setItem('organization', JSON.stringify(loginResponse.organization));
      setUser(loginResponse.user);
      setOrganization(loginResponse.organization);
      navigate('/');
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  };

  const register = async ({ email, password, organization: orgName, invite }: RegisterParams) => {
    try {
      const data = await authApi.register({
        email,
        password,
        organization: orgName,
        invite: invite
      });

      localStorage.setItem('api_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('organization', JSON.stringify(data.organization));
      setUser(data.user);
      setOrganization(data.organization);
      navigate('/');
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    setUser(null);
    setOrganization(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        login,
        register,
        logout,
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
