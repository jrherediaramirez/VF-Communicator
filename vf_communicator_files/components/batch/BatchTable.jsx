// components/batch/BatchTable.jsx
import React, { useState } from 'react'; // Import useState
import BatchRow from './BatchRow';
import BatchDetailDrawer from './BatchDetailDrawer'; // Import BatchDetailDrawer
import styles from './BatchTable.module.css';

const BatchTable = ({ batches, title, isLoading, error }) => {
  const [openedDrawerBatchId, setOpenedDrawerBatchId] = useState(null); // State for current open drawer

  const handleOpenDrawer = (batchId) => {
    setOpenedDrawerBatchId(batchId);
  };

  const handleCloseDrawer = () => {
    setOpenedDrawerBatchId(null);
  };

  if (isLoading) {
    return <p>Loading batches...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error loading batches: {error}</p>;
  }

  if (!batches || batches.length === 0) {
    return <p>No batches to display {title ? `for ${title}` : ''}.</p>;
  }

  const selectedBatchForDrawer = batches.find(batch => batch.id === openedDrawerBatchId);

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <BatchRow
              key={batch.id}
              batch={batch}
              onOpenDrawer={handleOpenDrawer} // Pass the handler to BatchRow
            />
          ))}
        </tbody>
      </table>

      {/* Render the BatchDetailDrawer outside and after the table */}
      {/* It will only be visible if a batch is selected */}
      {selectedBatchForDrawer && (
        <BatchDetailDrawer
          batch={selectedBatchForDrawer}
          isOpen={!!selectedBatchForDrawer} // Drawer is open if a batch is selected
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
};

export default BatchTable;