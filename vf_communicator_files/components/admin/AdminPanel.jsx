// components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import StaffReassignmentForm from './StaffReassignmentForm';
import { getActivePriorityBatches } from '../../lib/firebase/firestore'; // To get batches for reassignment
// Import functions to get lists of users (processors, QAs) if you have them
// For now, we'll use hardcoded UIDs or let admin type them.
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const [activeBatches, setActiveBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  // In a real app, you'd fetch users with processor/QA roles
  // const [processors, setProcessors] = useState([]);
  // const [qas, setQas] = useState([]);

  useEffect(() => {
    setLoadingBatches(true);
    const unsubscribe = getActivePriorityBatches(
      (batches) => {
        setActiveBatches(batches);
        setLoadingBatches(false);
      },
      (error) => {
        console.error("Admin Panel: Error fetching active batches:", error);
        setLoadingBatches(false);
      }
    );
    return () => unsubscribe();
  }, []);


  return (
    <div className={styles.adminPanel}>
      <section className={styles.panelSection}>
        <h2>Staff Reassignment</h2>
        {loadingBatches ? (
          <p>Loading active batches for reassignment...</p>
        ) : activeBatches.length > 0 ? (
          <StaffReassignmentForm batches={activeBatches} />
        ) : (
          <p>No active batches available for reassignment.</p>
        )}
        {/* In a real app, pass fetched processor/QA user lists to StaffReassignmentForm */}
      </section>

      <section className={styles.panelSection}>
        <h2>User Management (Placeholder)</h2>
        <p>Functionality to manage user roles (e.g., assign processor/QA/admin) would go here.</p>
        {/* This would involve Cloud Functions or a secure backend to set custom claims. */}
      </section>

      <section className={styles.panelSection}>
        <h2>Data Export (Placeholder)</h2>
        <p>Controls for triggering server-side data exports (e.g., CSV for a date range) would go here.</p>
      </section>
    </div>
  );
};

export default AdminPanel;