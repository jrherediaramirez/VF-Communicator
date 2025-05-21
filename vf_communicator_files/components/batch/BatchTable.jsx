// components/batch/BatchTable.jsx
import React from 'react';
import BatchRow from './BatchRow'; // We'll create this next
import styles from './BatchTable.module.css'; // We'll create this next

const BatchTable = ({ batches, title, isLoading, error }) => {
  if (isLoading) {
    return <p>Loading batches...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error loading batches: {error}</p>;
  }

  if (!batches || batches.length === 0) {
    return <p>No batches to display {title ? `for ${title}` : ''}.</p>;
  }

  return (
    <div className={styles.batchTableContainer}>
      {title && <h2>{title}</h2>}
      <table className={styles.batchTable}>
        <thead>
          <tr>
            <th>Formula</th>
            <th>Batch No.</th>
            <th>Deck</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th> {/* Placeholder for future actions */}
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <BatchRow key={batch.id} batch={batch} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BatchTable;