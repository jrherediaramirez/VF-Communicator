// components/batch/BatchRow.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, BATCH_STATUSES } from '../../constants';
import { updateBatchStatus, startQATesting } from '../../lib/firebase/firestore';
// import BatchDetailDrawer from './BatchDetailDrawer'; // Will create this
import styles from './BatchRow.module.css'; // You'll need to create/update this

// Placeholder for BatchDetailDrawer until it's created
const BatchDetailDrawer = ({ batch, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', backgroundColor: 'white', zIndex: 1000, padding: '20px', borderLeft: '1px solid #ccc', overflowY: 'auto' }}>
      <h2>Batch Details: {batch.formula} - {batch.batchNumber}</h2>
      <p>Status: {batch.status}</p>
      <p>ID: {batch.id}</p>
      <p>Processor: {batch.currentProcessorId || 'N/A'}</p>
      <p>QA: {batch.qaCurrentId || 'N/A'}</p>
      <p><em>(Sample List and Actions will go here)</em></p>
      <button onClick={onClose} style={{ marginTop: '20px' }}>Close Drawer</button>
    </div>
  );
};


const BatchRow = ({ batch }) => {
  const { user, role } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCompleteMixing = async () => {
    if (!user || role !== USER_ROLES.PROCESSOR) return;
    setIsLoading(true);
    setError('');
    try {
      await updateBatchStatus(batch.id, BATCH_STATUSES.COMPLETE, user.uid);
      // Status on UI will update via realtime listener
    } catch (err) {
      setError(err.message || 'Failed to complete mixing.');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleStartTesting = async () => {
    if (!user || role !== USER_ROLES.QA) return;
    setIsLoading(true);
    setError('');
    try {
      await startQATesting(batch.id, user.uid);
    } catch (err) {
      setError(err.message || 'Failed to start testing.');
      console.error(err);
    }
    setIsLoading(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
  };


  return (
    <>
      <tr className={styles.batchRow}>
        <td>{batch.formula}</td>
        <td>{batch.batchNumber}</td>
        <td>{batch.deck}</td>
        <td className={`${styles.status} ${styles[batch.status.replace('-', '')]}`}>{batch.status}</td>
        <td>{formatTimestamp(batch.lastUpdated)}</td>
        <td>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`${styles.actionButton} ${styles.detailsButton}`}
            disabled={isLoading}
          >
            Details
          </button>
          {role === USER_ROLES.PROCESSOR && batch.status === BATCH_STATUSES.MIXING && (
            <button
              onClick={handleCompleteMixing}
              className={`${styles.actionButton} ${styles.completeButton}`}
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Mixing'}
            </button>
          )}
          {role === USER_ROLES.QA && batch.status === BATCH_STATUSES.AWAITING_QA && !batch.qaCurrentId && (
            <button
              onClick={handleStartTesting}
              className={`${styles.actionButton} ${styles.startButton}`}
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Testing'}
            </button>
          )}
          {/* More actions can be added here based on role and batch status */}
        </td>
      </tr>
      {error && <tr className={styles.rowError}><td colSpan="6">{error}</td></tr>}

      <BatchDetailDrawer
        batch={batch}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default BatchRow;