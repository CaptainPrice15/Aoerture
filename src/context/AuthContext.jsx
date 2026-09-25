import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_STORAGE_KEY = 'aperture_admin_auth';
const USERS_STORAGE_KEY = 'aperture_registered_users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Invalidate legacy bypass session if present
          if (parsed && parsed.authenticated && !parsed.bypass) {
            return (
              parsed.user || {
                id: parsed.role === 'admin' ? 'admin' : 'member',
                name: parsed.role === 'admin' ? 'Admin' : 'Member',
                email: parsed.role === 'admin' ? 'admin@aperture.local' : '',
                role: parsed.role || 'user'
              }
            );
          }
          if (parsed?.bypass) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to read auth state from storage:', e);
      }
    }
    return null;
  });

  const isAuthenticated = !!user;

  const getAdminPassword = () => {
    return import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
  };

  const getRegisteredUsers = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read users from storage:', e);
    }
    return [];
  };

  const saveRegisteredUsers = (users) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to storage:', e);
    }
  };

  const login = (identifierOrPassword, maybePassword) => {
    let identifier = '';
    let password = '';

    if (typeof identifierOrPassword === 'object' && identifierOrPassword !== null) {
      identifier = (identifierOrPassword.identifier || identifierOrPassword.email || '').trim();
      password = identifierOrPassword.password || '';
    } else if (maybePassword !== undefined) {
      identifier = (identifierOrPassword || '').trim();
      password = maybePassword;
    } else {
      // Single argument passed (password only)
      identifier = '';
      password = identifierOrPassword || '';
    }

    const adminPass = getAdminPassword();

    // Check if logging in as Admin:
    // (Identifier is 'admin' or empty) and password matches admin password
    const isExplicitAdmin = identifier.toLowerCase() === 'admin';
    const isPasswordOnlyAdminMatch = !identifier && password === adminPass;
    const isAdminMatch = (isExplicitAdmin || isPasswordOnlyAdminMatch) && password === adminPass;

    if (isAdminMatch) {
      const adminUser = {
        id: 'admin',
        name: 'Admin',
        email: 'admin@aperture.local',
        role: 'admin'
      };
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              authenticated: true,
              role: 'admin',
              user: adminUser,
              timestamp: Date.now()
            })
          );
        } catch (e) {}
      }
      return { success: true, user: adminUser };
    }

    // Check registered users in storage
    const users = getRegisteredUsers();
    const foundUser = users.find(
      (u) =>
        (u.email?.toLowerCase() === identifier.toLowerCase() ||
          u.name?.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );

    if (foundUser) {
      const safeUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || 'user'
      };
      setUser(safeUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              authenticated: true,
              role: safeUser.role,
              user: safeUser,
              timestamp: Date.now()
            })
          );
        } catch (e) {}
      }
      return { success: true, user: safeUser };
    }

    // Fallback: If identifier was not supplied but password matches admin
    if (password === adminPass) {
      const adminUser = {
        id: 'admin',
        name: 'Admin',
        email: 'admin@aperture.local',
        role: 'admin'
      };
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              authenticated: true,
              role: 'admin',
              user: adminUser,
              timestamp: Date.now()
            })
          );
        } catch (e) {}
      }
      return { success: true, user: adminUser };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please check your username/email and password.'
    };
  };

  const signup = ({ name, email, password }) => {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your name.' };
    }

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (trimmedEmail === 'admin@aperture.local' || trimmedName.toLowerCase() === 'admin') {
      return { success: false, error: 'The name or email "admin" is reserved. Please choose another.' };
    }

    const users = getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    saveRegisteredUsers(updatedUsers);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    setUser(safeUser);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            authenticated: true,
            role: safeUser.role,
            user: safeUser,
            timestamp: Date.now()
          })
        );
      } catch (e) {}
    }

    return { success: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout
      }}
    >
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
