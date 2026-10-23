import { createContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  plan: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: () => false,
  register: () => false,
  logout: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;

  const login = (email: string, _password: string): boolean => {
    // Simulated login
    const mockUser: User = {
      id: 1,
      name: email.split('@')[0],
      email,
      credits: 15,
      plan: 'Professional',
    };
    setUser(mockUser);
    return true;
  };

  const register = (name: string, email: string, _password: string): boolean => {
    const mockUser: User = {
      id: 1,
      name,
      email,
      credits: 5,
      plan: 'Free',
    };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, setUser, isAuthenticated, login, register, logout }}>
      {children}
    </AppContext.Provider>
  );
};
