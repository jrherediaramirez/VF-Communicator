// pages/dashboard.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import RoleGuard from '../components/auth/RoleGuard';
import BatchTable from '../components/batch/BatchTable';
import { getActivePriorityBatches } from '../lib/firebase/firestore';
import { USER_ROLES } from '../constants';
import styles from '../styles/Page.module.css';

const DashboardContent = () => {
  const { user, role, logout } = useAuth();
  const [activeBatches, setActiveBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [batchesError, setBatchesError] = useState('');

  useEffect(() => {
    setIsLoadingBatches(true);
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

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard | BatchTrack</title>
      </Head>
      <h1>Active / Priority Batches</h1>
      
      {user && (
        <div style={{ marginBottom: 'var(--spacing-lg)'}}>
          <p>Welcome, {user.email}! (Role: {role || 'Not assigned'})</p>
          
          {/* Debug Info - Remove this after testing */}
          <div style={{
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            padding: '10px', 
            marginBottom: '20px',
            borderRadius: '4px'
          }}>
            <strong>🔍 Debug Info:</strong><br/>
            Email: {user?.email}<br/>
            Role: <code>{role || 'No role assigned'}</code><br/>
            User ID: <code>{user?.uid?.substring(0, 8)}...</code><br/>
          </div>
          
          {/* Processor Actions */}
          {role === USER_ROLES.PROCESSOR && (
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: '#e8f5e8', borderRadius: 'var(--border-radius)' }}>
              <h3>Processor Actions</h3>
              <p><a href="/batches/new" className="button-like">Start New Batch</a></p>
              <p>Create new batches and manage mixing processes.</p>
            </div>
          )}
          
          {/* QA Actions */}
          {role === USER_ROLES.QA && (
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: '#fff3e0', borderRadius: 'var(--border-radius)' }}>
              <h3>QA Actions</h3>
              <p><a href="/qa-queue" className="button-like">QA Queue</a></p>
              <p>Review and approve/deny batch samples.</p>
            </div>
          )}
          
          {/* Admin Actions */}
          {role === USER_ROLES.ADMIN && (
            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: '#f3e5f5', borderRadius: 'var(--border-radius)' }}>
              <h3>Admin Actions</h3>
              <p>
                <a href="/admin" className="button-like" style={{ marginRight: '10px' }}>Admin Panel</a>
                <a href="/archive" className="button-like">View Archive</a>
              </p>
              <p>Manage staff assignments, export data, and view all batch history.</p>
            </div>
          )}
          
          <button onClick={logout} style={{ padding: '8px 12px', marginTop: '10px' }}>Logout</button>
        </div>
      )}
      
      <BatchTable
        batches={activeBatches}
        isLoading={isLoadingBatches}
        error={batchesError}
      />
    </div>
  );
};

const DashboardPage = () => (
  <RoleGuard>
    <DashboardContent />
  </RoleGuard>
);

export default DashboardPage;