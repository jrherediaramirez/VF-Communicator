// components/batch/BatchRow.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; //
import { USER_ROLES, BATCH_STATUSES } from '../../constants'; //
import { updateBatchStatus, startQATesting } from '../../lib/firebase/firestore'; //
import styles from './BatchRow.module.css'; //

const BatchRow = ({ batch, onOpenDrawer }) => {
  const { user, role } = useAuth(); //
  const [isLoading, setIsLoading] = useState(false); //
  const [error, setError] = useState(''); //

  const handleCompleteMixing = async () => {
    if (!user || role !== USER_ROLES.PROCESSOR) return; //
    setIsLoading(true); //
    setError(''); //
    try {
      // Aligning with ProjectOverview.md: Processor moves status to 'awaitingQA'
      await updateBatchStatus(batch.id, BATCH_STATUSES.AWAITING_QA, user.uid); //
    } catch (err) {
      setError(err.message || 'Failed to complete mixing.'); //
      console.error(err); //
    }
    setIsLoading(false); //
  };

  const handleStartTesting = async () => {
    if (!user || role !== USER_ROLES.QA) return; //
    setIsLoading(true); //
    setError(''); //
    try {
      await startQATesting(batch.id, user.uid); //
    } catch (err) {
      setError(err.message || 'Failed to start testing.'); //
      console.error(err); //
    }
    setIsLoading(false); //
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'; //
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString(); //
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
            onClick={() => onOpenDrawer(batch.id)}
            className={`${styles.actionButton} ${styles.detailsButton}`}
            disabled={isLoading}
          >
            Details
          </button>
          {role === USER_ROLES.PROCESSOR && batch.status === BATCH_STATUSES.MIXING && ( //
            <button
              onClick={handleCompleteMixing} //
              className={`${styles.actionButton} ${styles.completeButton}`}
              disabled={isLoading} //
            >
              {isLoading ? 'Processing...' : 'Mixing Complete'} 
            </button>
          )}
          {role === USER_ROLES.QA && batch.status === BATCH_STATUSES.AWAITING_QA && !batch.qaCurrentId && ( //
            <button
              onClick={handleStartTesting} //
              className={`${styles.actionButton} ${styles.startButton}`}
              disabled={isLoading} //
            >
              {isLoading ? 'Starting...' : 'Start Testing'}
            </button>
          )}
        </td>
      </tr>
      {error && <tr className={styles.rowError}><td colSpan="6">{error}</td></tr>} 
    </>
  );
};

export default BatchRow;