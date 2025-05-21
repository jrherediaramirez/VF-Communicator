// components/batch/BatchDetailDrawer.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, BATCH_STATUSES } from '../../constants';
import { getSamplesForBatch } from '../../lib/firebase/firestore';
import SampleForm from './SampleForm';
import SampleList from './SampleList';
import QAActionBar from '../qa/QAActionBar'; // Will create this
import styles from './BatchDetailDrawer.module.css';

const BatchDetailDrawer = ({ batch, isOpen, onClose }) => {
  const { user, role } = useAuth();
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [errorSamples, setErrorSamples] = useState('');

  useEffect(() => {
    if (!isOpen || !batch || !batch.id) {
      setSamples([]); // Clear samples when drawer is closed or no batch
      return;
    }

    setLoadingSamples(true);
    setErrorSamples('');
    const unsubscribe = getSamplesForBatch(
      batch.id,
      (fetchedSamples) => {
        setSamples(fetchedSamples);
        setLoadingSamples(false);
      },
      (err) => {
        setErrorSamples(err.message || 'Failed to load samples.');
        setLoadingSamples(false);
        console.error(err);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount or batch change
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const canSubmitSample = role === USER_ROLES.PROCESSOR &&
                         (batch.status === BATCH_STATUSES.COMPLETE || batch.status === BATCH_STATUSES.AWAITING_QA);

  const canPerformQAAction = role === USER_ROLES.QA &&
                             batch.status === BATCH_STATUSES.AWAITING_QA &&
                             samples.some(s => s.result === 'pending' && (batch.qaCurrentId === user?.uid || !batch.qaCurrentId));


  return (
    <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.drawerHeader}>
        <h3>
          {batch.formula} - {batch.batchNumber}
          <span className={`${styles.statusBadge} ${styles[batch.status.replace('-', '')]}`}>{batch.status}</span>
        </h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      <div className={styles.drawerContent}>
        <h4>Batch Info</h4>
        <p><strong>Deck:</strong> {batch.deck}</p>
        <p><strong>Started:</strong> {batch.startedAt?.toDate ? batch.startedAt.toDate().toLocaleString() : 'N/A'}</p>
        <p><strong>Current Processor:</strong> {batch.currentProcessorId || 'N/A'}</p>
        <p><strong>Current QA Tester:</strong> {batch.qaCurrentId || 'N/A'}</p>

        <hr className={styles.divider} />

        <h4>Samples</h4>
        {loadingSamples && <p>Loading samples...</p>}
        {errorSamples && <p className={styles.errorText}>{errorSamples}</p>}
        {!loadingSamples && !errorSamples && (
          <SampleList samples={samples} batchId={batch.id} />
        )}

        {canSubmitSample && user && (
          <>
            <hr className={styles.divider} />
            <SampleForm batchId={batch.id} processorId={user.uid} />
          </>
        )}

        {canPerformQAAction && user && (
          <>
            <hr className={styles.divider} />
            <QAActionBar batch={batch} samples={samples} qaId={user.uid} />
          </>
        )}
      </div>
    </div>
  );
};

export default BatchDetailDrawer;