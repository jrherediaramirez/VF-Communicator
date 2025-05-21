// pages/dashboard.jsx
import React from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import RoleGuard from '../components/auth/RoleGuard';
// import { USER_ROLES } from '../constants'; // If you want to specify roles for the guard

const DashboardPage = () => {
  const { user, role, logout } = useAuth(); // Get logout for testing

  return (
    <div className={styles.container}> {/* Optional */}
      <Head>
        <title>Dashboard | BatchTrack</title>
      </Head>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>Your Role: {role || 'Not assigned'}</p>
          <p>User UID: {user.uid}</p>
          <button onClick={logout} style={{ padding: '10px', marginTop: '20px' }}>Logout</button>
          {/* BatchTable will go here in Step 2 */}
        </div>
      ) : (
        <p>Loading user data or not logged in...</p>
      )}
    </div>
  );
};

// Wrap the page with RoleGuard
// For now, just ensure the user is authenticated.
// You can specify allowedRoles later: e.g., allowedRoles={[USER_ROLES.PROCESSOR, USER_ROLES.QA]}
const ProtectedDashboardPage = () => (
  <RoleGuard>
    <DashboardPage />
  </RoleGuard>
);

export default ProtectedDashboardPage;
// Or, if you prefer HOC style for RoleGuard:
// export default RoleGuard()(DashboardPage);
// Or apply RoleGuard directly in _app.jsx for specific routes if preferred