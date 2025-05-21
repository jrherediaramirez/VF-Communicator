// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
// We will import Firebase auth methods later
// import { auth } from '../lib/firebase/config';
// import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Can be user object or null
  const [role, setRole] = useState(null);   // e.g., 'processor', 'qa', 'admin'
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  // useEffect(() => {
  //   // This is where Firebase onAuthStateChanged listener will go
  //   // For now, simulate loading and no user
  //   const timer = setTimeout(() => {
  //     setUser(null);
  //     setRole(null);
  //     setLoading(false);
  //   }, 1000); // Simulate async check
  //
  //   return () => clearTimeout(timer);
  // }, []);

  // Placeholder: Simulate loading ending
  useEffect(() => {
    setLoading(false);
  }, []);


  const value = {
    user,
    setUser, // Will be replaced by Firebase auth methods
    role,
    setRole,   // Will be managed by custom claims logic
    loading,
    // login: async (email, password) => { /* ... */ },
    // logout: async () => { /* ... */ },
    // signup: async (email, password) => { /* ... */ },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};