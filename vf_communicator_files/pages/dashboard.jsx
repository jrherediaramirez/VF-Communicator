// pages/dashboard.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import RoleGuard from '../components/auth/RoleGuard';
import BatchTable from '../components/batch/BatchTable';
import { getActivePriorityBatches } from '../lib/firebase/firestore';
import { USER_ROLES } from '../constants'; // For role-specific UI elements if needed
import styles from '../styles/Page.module.css';

const DashboardContent = () => {
  const { user, role, logout } = useAuth();
  const [activeBatches, setActiveBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [batchesError, setBatchesError] = useState('');

  useEffect(() => {
    setIsLoadingBatches(true);
    // Set up the real-time listener for active/priority batches
    const unsubscribe = getActivePriorityBatches(
      (batches) => {
        setActiveBatches(batches);
        setIsLoadingBatches(false);
        setBatchesError('');
      },
      (error) => {
        console.error("Dashboard Firestore error:", error);
        setBatchesError(error.message || "Could not load batches.");
        setIsLoadingBatches(false);
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard | BatchTrack</title>
      </Head>
      <h1>Active / Priority Batches</h1>
      {user && ( // Display user info only if user is loaded
        <div style={{ marginBottom: 'var(--spacing-lg)'}}>
          <p>Welcome, {user.email}! (Role: {role || 'Not assigned'})</p>
          {role === USER_ROLES.PROCESSOR && (
            <p><a href="/batches/new" className="button-like">Start New Batch</a></p>
          )}
          <button onClick={logout} style={{ padding: '8px 12px', marginTop: '10px' }}>Logout</button>
        </div>
      )}
      
      <BatchTable
        batches={activeBatches}
        // title="Active / Priority" // Title is already in H1
        isLoading={isLoadingBatches}
        error={batchesError}
      />
    </div>
  );
};

// Use RoleGuard to protect the dashboard.
// For now, any authenticated user can view the dashboard.
// You can restrict further by passing allowedRoles prop if needed.
const DashboardPage = () => (
  <RoleGuard>
    <DashboardContent />
  </RoleGuard>
);

export default DashboardPage;