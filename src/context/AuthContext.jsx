import React, { createContext, useContext, useState, useEffect } from 'react';
import { recordPhotoLove } from '../utils/analytics';

const AuthContext = createContext(null);

const SESSION_STORAGE_KEY = 'aperture_admin_auth';
const USERS_STORAGE_KEY = 'aperture_registered_users';
const FAVORITES_KEY_PREFIX = 'aperture_favorites_';

// Cryptographic SHA-256 password hashing with salt
const hashPassword = async (password, salt = 'aperture_sec_salt_2026') => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return password;
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Password hash error:', err);
    return password;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.authenticated && !parsed.bypass) {
            // Browser storage is user-controlled and cannot establish an admin session.
            if (parsed.role === 'admin' || parsed.user?.role === 'admin') return null;
            if (parsed.user) return parsed.user;
            if (parsed.role === 'admin') {
              return {
                id: 'admin',
                name: 'Admin',
                email: 'admin@aperture.local',
                role: 'admin'
              };
            }
            if (parsed.role === 'userstd') {
              return {
                id: 'userstd',
                name: 'Standard User (userstd)',
                email: 'userstd@aperture.local',
                role: 'userstd'
              };
            }
            return {
              id: 'member',
              name: 'Member',
              email: '',
              role: parsed.role || 'user'
            };
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

  useEffect(() => {
    let active = true;
    fetch('/api/auth', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : null)
      .then((session) => {
        if (active && session?.authenticated) {
          setUser({ id: 'admin', name: 'Admin', email: 'admin', role: 'admin' });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Favorites state for active user (or guest)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const uid = user?.id || 'guest';
        const saved = localStorage.getItem(`${FAVORITES_KEY_PREFIX}${uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  // Keep favorites in sync when user logs in/out
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const uid = user?.id || 'guest';
        const saved = localStorage.getItem(`${FAVORITES_KEY_PREFIX}${uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
            return;
          }
        }
        setFavorites([]);
      } catch (e) {
        setFavorites([]);
      }
    }
  }, [user?.id]);

  const toggleFavorite = (photoId) => {
    if (!photoId) return;
    setFavorites((prev) => {
      const exists = prev.includes(photoId);
      const updated = exists ? prev.filter((id) => id !== photoId) : [...prev, photoId];
      if (typeof window !== 'undefined') {
        try {
          const uid = user?.id || 'guest';
          localStorage.setItem(`${FAVORITES_KEY_PREFIX}${uid}`, JSON.stringify(updated));
        } catch (e) {}
      }
      try {
        recordPhotoLove(photoId, !exists);
      } catch (err) {}
      return updated;
    });
  };

  const isFavorite = (photoId) => {
    return favorites.includes(photoId);
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

  const login = async (identifierOrPassword, maybePassword) => {
    let identifier = '';
    let rawPassword = '';

    if (typeof identifierOrPassword === 'object' && identifierOrPassword !== null) {
      identifier = (identifierOrPassword.identifier || identifierOrPassword.email || '').trim();
      rawPassword = identifierOrPassword.password || '';
    } else if (maybePassword !== undefined) {
      identifier = (identifierOrPassword || '').trim();
      rawPassword = maybePassword;
    } else {
      identifier = '';
      rawPassword = identifierOrPassword || '';
    }

    if (identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@aperture.local') {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ password: rawPassword })
        });
        const result = await response.json();
        if (!response.ok) return { success: false, error: result.error || 'Administrator sign-in failed.' };
        const adminUser = result.user;
        setUser(adminUser);
        try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}
        return { success: true, user: adminUser };
      } catch {
        return { success: false, error: 'Could not reach the server authentication endpoint.' };
      }
    }

    // Check if logging in as userstd (Standard User with NO delete permission):
    const isExplicitUserStd =
      identifier.toLowerCase() === 'userstd' || identifier.toLowerCase() === 'userstd@aperture.local';
    const isUserStdMatch = isExplicitUserStd && (rawPassword === 'userstd' || rawPassword === 'userstd123');

    if (isUserStdMatch) {
      const stdUser = {
        id: 'userstd',
        name: 'Standard User (userstd)',
        email: 'userstd@aperture.local',
        role: 'userstd'
      };
      setUser(stdUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              authenticated: true,
              role: 'userstd',
              user: stdUser,
              timestamp: Date.now()
            })
          );
        } catch (e) {}
      }
      return { success: true, user: stdUser };
    }

    // Check registered users
    const hashed = await hashPassword(rawPassword);
    const users = getRegisteredUsers();

    const foundUser = users.find(
      (u) =>
        (u.email?.toLowerCase() === identifier.toLowerCase() ||
          u.name?.toLowerCase() === identifier.toLowerCase()) &&
        (u.password === hashed || u.password === rawPassword) // supports both hashed and legacy plain
    );

    if (foundUser) {
      // Auto-upgrade plain password to hashed if needed
      if (foundUser.password === rawPassword && foundUser.password !== hashed) {
        foundUser.password = hashed;
        saveRegisteredUsers(users);
      }

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

    return {
      success: false,
      error: 'Invalid credentials. Please check your username/email and password.'
    };
  };

  const signup = async ({ name, email, password }) => {
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

    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
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
    if (user?.role === 'admin') {
      fetch('/api/auth', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {}
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStandardUser = user?.role === 'userstd';
  // Strictly admin has delete permissions; userstd and guests do not
  const canDelete = isAdmin;
  const canEdit = isAdmin;
  const canAddMedia = isAdmin;
  const canViewAnalytics = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isAdmin,
        isStandardUser,
        canDelete,
        canEdit,
        canAddMedia,
        canViewAnalytics,
        favorites,
        toggleFavorite,
        isFavorite,
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
