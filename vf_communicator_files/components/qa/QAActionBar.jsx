// components/qa/QAActionBar.jsx
import React, { useState, useEffect } from 'react';
import { updateSampleResult } from '../../lib/firebase/firestore';
import { SAMPLE_RESULTS } from '../../constants';
import styles from './QAActionBar.module.css';

const QAActionBar = ({ batch, samples, qaId }) => {
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pendingSamples = samples.filter(s => s.result === SAMPLE_RESULTS.PENDING);

  useEffect(() => {
    // Auto-select the first pending sample if available
    if (pendingSamples.length > 0 && !selectedSampleId) {
      setSelectedSampleId(pendingSamples[0].id);
    } else if (pendingSamples.length === 0) {
        setSelectedSampleId(''); // Clear selection if no pending samples
    }
  }, [samples, pendingSamples, selectedSampleId]);


  const handleDecision = async (result) => {
    if (!selectedSampleId) {
      setError("Please select a pending sample to make a decision.");
      return;
    }
    if (result === SAMPLE_RESULTS.DENIED && !decisionNotes.trim()) {
      setError("Notes are required when denying a sample.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const decisionData = {
      qaId: qaId,
      result: result,
      notes: decisionNotes,
    };

    try {
      await updateSampleResult(batch.id, selectedSampleId, decisionData);
      setSuccess(`Sample decision (${result}) recorded successfully.`);
      setDecisionNotes(''); // Clear notes
      // SelectedSampleId will update via useEffect if no more pending or a new one is first
    } catch (err) {
      setError(err.message || 'Failed to record decision.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingSamples.length === 0) {
    return <p className={styles.infoText}>No pending samples for this batch requiring QA action.</p>;
  }

  return (
    <div className={styles.qaActionBar}>
      <h4>QA Decision for Batch: {batch.formula} - {batch.batchNumber}</h4>
      {error && <p className={styles.errorText}>{error}</p>}
      {success && <p className={styles.successText}>{success}</p>}

      <div className={styles.formGroup}>
        <label htmlFor={`qa-sample-select-${batch.id}`} className={styles.label}>Select Pending Sample:</label>
        <select
          id={`qa-sample-select-${batch.id}`}
          value={selectedSampleId}
          onChange={(e) => setSelectedSampleId(e.target.value)}
          className={styles.select}
          disabled={isLoading}
        >
          <option value="" disabled>-- Select a Sample --</option>
          {pendingSamples.map(sample => (
            <option key={sample.id} value={sample.id}>
              Attempt {sample.attempt} (Submitted: {sample.submittedAt?.toDate ? sample.submittedAt.toDate().toLocaleTimeString() : 'N/A'})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`qa-decision-notes-${batch.id}`} className={styles.label}>Decision Notes:</label>
        <textarea
          id={`qa-decision-notes-${batch.id}`}
          value={decisionNotes}
          onChange={(e) => setDecisionNotes(e.target.value)}
          className={styles.textarea}
          rows="3"
          placeholder="Notes required if denying..."
          disabled={isLoading || !selectedSampleId}
        />
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={() => handleDecision(SAMPLE_RESULTS.APPROVED)}
          className={`${styles.button} ${styles.approveButton}`}
          disabled={isLoading || !selectedSampleId}
        >
          Approve Sample
        </button>
        <button
          onClick={() => handleDecision(SAMPLE_RESULTS.DENIED)}
          className={`${styles.button} ${styles.denyButton}`}
          disabled={isLoading || !selectedSampleId}
        >
          Deny Sample
        </button>
      </div>
       {/* Placeholder for "Place Batch On-Hold" / "Reject Batch" from future steps
      <div className={styles.batchActions}>
        <button className={`${styles.button} ${styles.onHoldButton}`} disabled={isLoading}>Place Batch On-Hold</button>
        <button className={`${styles.button} ${styles.rejectBatchButton}`} disabled={isLoading}>Reject Entire Batch</button>
      </div>
      */}
    </div>
  );
};

export default QAActionBar;