
import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';


interface AuthProviderProps {
  children: ReactNode; }

// Define the shape of the user data returned by the backend
interface AuthUser {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  is_profile_complete: boolean; // Crucial for redirection
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (accessToken: string, userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (accessToken: string, userData: AuthUser) => {
    setToken(accessToken);
    setUser(userData);
    // In a production app, you'd also save the token/user to localStorage/sessionStorage here
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Clear storage here
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};