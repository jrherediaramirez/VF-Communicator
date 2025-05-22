// components/qa/QAActionBar.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { USER_ROLES, SAMPLE_RESULTS, BATCH_STATUSES } from '../../constants'; // Import USER_ROLES
import { updateSampleResult, setBatchOnHold, setBatchRejected } from '../../lib/firebase/firestore';
import styles from './QAActionBar.module.css';

const QAActionBar = ({ batch, samples, qaId }) => { // qaId is the current logged-in QA user
  const { role: currentUserRole } = useAuth(); // Get current user's role
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pendingSamples = samples.filter(s => s.result === SAMPLE_RESULTS.PENDING);

  useEffect(() => {
    if (pendingSamples.length > 0 && !selectedSampleId) {
      setSelectedSampleId(pendingSamples[0].id);
    } else if (pendingSamples.length === 0) {
      setSelectedSampleId('');
    }
  }, [samples, pendingSamples, selectedSampleId]);

  const handleSampleDecision = async (result) => {
    // ... (existing handleSampleDecision logic from Step 3)
    if (!selectedSampleId) { setError("Please select a pending sample."); return; }
    if (result === SAMPLE_RESULTS.DENIED && !decisionNotes.trim()) { setError("Notes are required for denial."); return; }
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await updateSampleResult(batch.id, selectedSampleId, { qaId, result, notes: decisionNotes });
      setSuccess(`Sample ${result} successfully.`); setDecisionNotes('');
    } catch (err) { setError(err.message || 'Failed to record sample decision.'); }
    finally { setIsLoading(false); }
  };

  const handlePlaceOnHold = async () => {
    if (!qaId) return; // Ensure QA user is identified
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await setBatchOnHold(batch.id, qaId);
      setSuccess('Batch placed on-hold successfully.');
    } catch (err) { setError(err.message || 'Failed to place batch on-hold.'); }
    finally { setIsLoading(false); }
  };

  const handleRejectBatch = async () => {
    if (!qaId) return;
    if (!decisionNotes.trim()) { // Using decisionNotes field for rejection notes too
      setError("Rejection notes are required to reject the entire batch.");
      return;
    }
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await setBatchRejected(batch.id, qaId, decisionNotes);
      setSuccess('Batch rejected successfully.');
      setDecisionNotes('');
    } catch (err) { setError(err.message || 'Failed to reject batch.'); }
    finally { setIsLoading(false); }
  };

  const canPerformBatchActions = currentUserRole === USER_ROLES.QA || currentUserRole === USER_ROLES.ADMIN;
  // Batch status suitable for on-hold/reject actions (e.g., not already approved/rejected)
  const suitableStatusForHoldReject = ![BATCH_STATUSES.APPROVED, BATCH_STATUSES.REJECTED].includes(batch.status);


  return (
    <div className={styles.qaActionBar}>
      <h4>QA Actions for Batch: {batch.formula} - {batch.batchNumber}</h4>
      {error && <p className={styles.errorText}>{error}</p>}
      {success && <p className={styles.successText}>{success}</p>}

      {/* Sample Decision Section (from Step 3) */}
      {pendingSamples.length > 0 && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor={`qa-sample-select-${batch.id}`} className={styles.label}>Select Pending Sample:</label>
            <select id={`qa-sample-select-${batch.id}`} value={selectedSampleId} onChange={(e) => setSelectedSampleId(e.target.value)} className={styles.select} disabled={isLoading}>
              <option value="" disabled>-- Select --</option>
              {pendingSamples.map(sample => (<option key={sample.id} value={sample.id}>Attempt {sample.attempt}</option>))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor={`qa-decision-notes-${batch.id}`} className={styles.label}>Decision Notes (for sample/rejection):</label>
            <textarea id={`qa-decision-notes-${batch.id}`} value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} className={styles.textarea} rows="3" placeholder="Notes for sample decision or batch rejection..." disabled={isLoading || !selectedSampleId && pendingSamples.length > 0}/>
          </div>
          <div className={styles.actionButtons}>
            <button onClick={() => handleSampleDecision(SAMPLE_RESULTS.APPROVED)} className={`${styles.button} ${styles.approveButton}`} disabled={isLoading || !selectedSampleId}>Approve Sample</button>
            <button onClick={() => handleSampleDecision(SAMPLE_RESULTS.DENIED)} className={`${styles.button} ${styles.denyButton}`} disabled={isLoading || !selectedSampleId}>Deny Sample</button>
          </div>
          <hr className={styles.divider} />
        </>
      )}
      {pendingSamples.length === 0 && batch.status === BATCH_STATUSES.AWAITING_QA && (
        <p className={styles.infoText}>All samples decided. Batch still Awaiting QA (perhaps for re-test or final batch decision).</p>
      )}


      {/* Batch Level Actions */}
      {canPerformBatchActions && suitableStatusForHoldReject && (
        <div className={styles.batchActions}>
          <h5>Batch Level Actions:</h5>
          <div className={styles.formGroup}> {/* Re-using notes field for rejection */}
            <label htmlFor={`qa-batch-action-notes-${batch.id}`} className={styles.label}>Notes (for Batch Rejection):</label>
            <textarea id={`qa-batch-action-notes-${batch.id}`} value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} className={styles.textarea} rows="2" placeholder="Required if rejecting entire batch" disabled={isLoading}/>
          </div>
          <button onClick={handlePlaceOnHold} className={`${styles.button} ${styles.onHoldButton}`} disabled={isLoading || batch.status === BATCH_STATUSES.ON_HOLD}>
            {isLoading && batch.status !== BATCH_STATUSES.ON_HOLD ? 'Processing...' : 'Place Batch On-Hold'}
          </button>
          <button onClick={handleRejectBatch} className={`${styles.button} ${styles.rejectBatchButton}`} disabled={isLoading || batch.status === BATCH_STATUSES.REJECTED}>
            {isLoading && batch.status !== BATCH_STATUSES.REJECTED ? 'Processing...' : 'Reject Entire Batch'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QAActionBar;