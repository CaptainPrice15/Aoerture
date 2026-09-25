import React, { createContext, useContext, useState, useEffect } from 'react';

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
      return updated;
    });
  };

  const isFavorite = (photoId) => {
    return favorites.includes(photoId);
  };

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

    const adminPass = getAdminPassword();

    // Check if logging in as Admin:
    const isExplicitAdmin = identifier.toLowerCase() === 'admin';
    const isPasswordOnlyAdminMatch = !identifier && rawPassword === adminPass;
    const isAdminMatch = (isExplicitAdmin || isPasswordOnlyAdminMatch) && rawPassword === adminPass;

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

    // Direct password match for admin without username
    if (rawPassword === adminPass) {
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
