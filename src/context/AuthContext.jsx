import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'aperture_admin_auth';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.authenticated) {
            return true;
          }
        }
      } catch (e) {
        console.error('Failed to read auth state from storage:', e);
      }
    }
    return false;
  });

  const getAdminPassword = () => {
    return import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
  };

  const login = (password) => {
    const validPassword = getAdminPassword();
    if (password === validPassword) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ authenticated: true, role: 'admin', timestamp: Date.now() })
          );
        } catch (e) {}
      }
      return { success: true };
    }
    return { success: false, error: 'Incorrect password. Try again or use Admin Bypass.' };
  };

  const adminBypass = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ authenticated: true, role: 'admin', bypass: true, timestamp: Date.now() })
        );
      } catch (e) {}
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, adminBypass, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
