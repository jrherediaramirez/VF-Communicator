// components/batch/SampleForm.jsx
import React, { useState } from 'react';
import { submitSample } from '../../lib/firebase/firestore';
import styles from './SampleForm.module.css';

const SampleForm = ({ batchId, processorId }) => {
  const [notes, setNotes] = useState(''); // Optional notes from processor
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!processorId) {
      setError("Processor ID is missing. Cannot submit sample.");
      setIsLoading(false);
      return;
    }

    const sampleData = {
      submitterId: processorId,
      notes: notes,
    };

    try {
      await submitSample(batchId, sampleData);
      setSuccess('Sample submitted successfully! Batch is now awaiting QA.');
      setNotes(''); // Clear form
    } catch (err) {
      setError(err.message || 'Failed to submit sample.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.sampleFormContainer}>
      <h4>Submit New Sample</h4>
      {error && <p className={styles.errorText}>{error}</p>}
      {success && <p className={styles.successText}>{success}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor={`sample-notes-${batchId}`} className={styles.label}>Submission Notes (Optional):</label>
          <textarea
            id={`sample-notes-${batchId}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
            rows="3"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Sample to QA'}
        </button>
      </form>
    </div>
  );
};

export default SampleForm;