// components/batch/SampleList.jsx
import React from 'react';
import { SAMPLE_RESULTS } from '../../constants';
import styles from './SampleList.module.css';

const SampleList = ({ samples, batchId }) => {
  if (!samples || samples.length === 0) {
    return <p className={styles.noSamples}>No samples submitted for this batch yet.</p>;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
  };

  return (
    <ul className={styles.sampleList}>
      {samples.map((sample) => (
        <li key={sample.id} className={`${styles.sampleItem} ${styles[sample.result]}`}>
          <div className={styles.sampleHeader}>
            <strong>Attempt {sample.attempt}</strong>
            <span className={`${styles.resultBadge} ${styles['badge' + sample.result.charAt(0).toUpperCase() + sample.result.slice(1)]}`}>
              {sample.result}
            </span>
          </div>
          <div className={styles.sampleDetails}>
            <p><strong>Submitted:</strong> {formatTimestamp(sample.submittedAt)} by {sample.submitterId.substring(0,6)}...</p>
            {sample.result !== SAMPLE_RESULTS.PENDING && (
              <p><strong>Decided:</strong> {formatTimestamp(sample.decidedAt)} by QA {sample.qaId?.substring(0,6) || 'N/A'}...</p>
            )}
            {sample.notes && <p className={styles.notes}><strong>Notes:</strong> {sample.notes}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SampleList;