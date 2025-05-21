// hooks/useAuth.js
import { useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext'; // Assuming AuthContext is exported directly

// If AuthContext is not default export or you want to be specific:
// Make sure AuthContext is exported from contexts/AuthContext.jsx like:
// export const AuthContext = createContext();
// Then import it:
// import { AuthContext } from '../contexts/AuthContext';

// For this setup, since useAuth is already in AuthContext.jsx, this file might be redundant
// unless you change the export structure of AuthContext.jsx.
// If AuthContext.jsx exports useAuth, then you just import useAuth from there.

// If AuthContext is exported as default or named from contexts/AuthContext.jsx:
// const AuthContext = React.createContext(); // in AuthContext.jsx
// export default AuthContext; // or export { AuthContext }
//
// Then here:
// import AuthContext from '../contexts/AuthContext'; // if default
// import { AuthContext } from '../contexts/AuthContext'; // if named

// Assuming useAuth is NOT exported from AuthContext.jsx and AuthContext itself is exported:
// import { AuthContext } from '../contexts/AuthContext';
//
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// Given our current AuthContext.jsx which exports useAuth directly:
// This file is not strictly needed unless you restructure.
// For now, we'll assume you'll import useAuth directly from '../contexts/AuthContext'.
// If you want this file, ensure AuthContext.jsx exports ONLY AuthContext and AuthProvider,
// and then define useAuth here:
//
// import React, { useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext'; // Ensure AuthContext is exported
//
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };