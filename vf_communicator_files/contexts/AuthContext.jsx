// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedWrapper,
  // signUpWithEmail, // Import if you implement sign-up
} from '../lib/firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedWrapper(
      ({ user: authUser, role: userRole, loading: authLoading, error }) => {
        setUser(authUser);
        setRole(userRole);
        setLoading(authLoading);
        if (error) {
          setAuthError(error.message || 'Authentication listener error');
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmail(email, password);
      return true;
    } catch (error) {
      setAuthError(error.message || 'Failed to login with email.');
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      return true;
    } catch (error) {
      // Ignore user-closed popups
      if (
        error.code !== 'auth/popup-closed-by-user' &&
        error.code !== 'auth/cancelled-popup-request'
      ) {
        setAuthError(error.message || 'Failed to login with Google.');
      }
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOutUser();
    } catch (error) {
      setAuthError(error.message || 'Failed to logout.');
      setLoading(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    authError,
    loginWithEmail,
    loginWithGoogle,
    logout,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
