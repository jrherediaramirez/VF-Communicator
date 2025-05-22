// components/admin/StaffReassignmentForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reassignProcessor, reassignQA } from '../../lib/firebase/firestore';
import styles from './StaffReassignmentForm.module.css';

const StaffReassignmentForm = ({ batches /*, processors, qas */ }) => {
  const { user: adminUser } = useAuth(); // The logged-in admin
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [targetUserId, setTargetUserId] = useState(''); // UID of processor/QA to assign
  const [assignmentType, setAssignmentType] = useState('processor'); // 'processor' or 'qa'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !targetUserId.trim() || !adminUser) {
      setError("Please select a batch, enter a target User UID, and ensure you are logged in as admin.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (assignmentType === 'processor') {
        await reassignProcessor(selectedBatchId, targetUserId.trim(), adminUser.uid);
        setSuccess(`Processor reassigned successfully for batch ${selectedBatchId}.`);
      } else { // assignmentType === 'qa'
        await reassignQA(selectedBatchId, targetUserId.trim(), adminUser.uid);
        setSuccess(`QA reassigned successfully for batch ${selectedBatchId}.`);
      }
      // Clear fields after success
      // setSelectedBatchId(''); // Keep batch selected for potential multiple reassignments?
      setTargetUserId('');
    } catch (err) {
      setError(err.message || "Failed to reassign staff.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!batches || batches.length === 0) {
    return <p>No active batches to select for reassignment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.reassignmentForm}>
      {error && <p className={styles.errorText}>{error}</p>}
      {success && <p className={styles.successText}>{success}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="batch-select" className={styles.label}>Select Batch:</label>
        <select
          id="batch-select"
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className={styles.select}
          required
        >
          <option value="" disabled>-- Select a Batch --</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.formula} - {batch.batchNumber} (Status: {batch.status})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="assignment-type" className={styles.label}>Reassign:</label>
        <select
          id="assignment-type"
          value={assignmentType}
          onChange={(e) => setAssignmentType(e.target.value)}
          className={styles.select}
        >
          <option value="processor">Processor</option>
          <option value="qa">QA Tester</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="target-user-id" className={styles.label}>
          New {assignmentType === 'processor' ? 'Processor' : 'QA Tester'} User UID:
        </label>
        <input
          type="text"
          id="target-user-id"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className={styles.input}
          placeholder={`Enter UID of the new ${assignmentType}`}
          required
        />
        {/* In a real app, replace text input with a dropdown populated from fetched users list */}
      </div>

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Reassigning...' : `Reassign ${assignmentType === 'processor' ? 'Processor' : 'QA'}`}
      </button>
    </form>
  );
};

export default StaffReassignmentForm;