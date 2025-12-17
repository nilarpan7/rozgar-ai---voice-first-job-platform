
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Language } from '../types';
import { AuthService } from '../services/authService';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
  t: Record<string, string>; // Direct access to current dictionary
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]); // Hindi default

  useEffect(() => {
    // Check for existing session
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (phone: string, role: UserRole) => {
    setLoading(true);
    try {
      const loggedInUser = await AuthService.login(phone, role);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const translate = (key: string): string => {
    const dict = TRANSLATIONS[language.code] || TRANSLATIONS['en'];
    return dict[key] || key;
  };

  const t = TRANSLATIONS[language.code] || TRANSLATIONS['en'];

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, language, setLanguage, translate, t }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
