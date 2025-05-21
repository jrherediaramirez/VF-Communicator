// components/auth/RoleGuard.jsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
// import styles from './RoleGuard.module.css'; // If you need specific styling

/**
 * A component to protect routes based on authentication status and user roles.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to render if authorized.
 * @param {string[]} [props.allowedRoles] - Optional array of roles allowed to access.
 *                                         If not provided, just checks for authentication.
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait for authentication state to be determined
    }

    if (!user) {
      // User not authenticated, redirect to login
      // Pass the current path as returnUrl so user can be redirected back after login
      router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      // User is authenticated but does not have an allowed role
      // Redirect to an unauthorized page or home page
      console.warn(`User with role '${role}' tried to access a route restricted to roles: ${allowedRoles.join(', ')}`);
      router.push('/unauthorized'); // Or '/' or some other appropriate page
      return;
    }

    // If we reach here, user is authenticated and (if allowedRoles provided) has a permitted role.
  }, [user, role, loading, router, allowedRoles]);

  // While loading or if redirection is about to happen,
  // render nothing or a loading indicator to prevent content flash.
  if (loading || !user || (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) && user /* to ensure user is checked first*/ )) {
    // Consider a more sophisticated loading screen for better UX
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <p>Checking permissions...</p> {/* Or a spinner component */}
        </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default RoleGuard;