// pages/archive.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext'; // For potential RoleGuard if needed
import RoleGuard from '../components/auth/RoleGuard';
import BatchTable from '../components/batch/BatchTable';
import { getAllBatchesForArchive } from '../lib/firebase/firestore';
import { BATCH_STATUSES } from '../constants';
import styles from '../styles/Page.module.css';

const ArchivePageContent = () => {
  const [allBatches, setAllBatches] = useState([]);
  const [archivedBatches, setArchivedBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getAllBatchesForArchive(
      (batches) => {
        setAllBatches(batches); // Store all fetched batches
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load archive data.');
        setLoading(false);
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Client-side filtering for archive
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();
    const filtered = allBatches.filter(batch => {
      const batchTimestamp = batch.lastUpdated?.toDate ? batch.lastUpdated.toDate().getTime() : 0;
      return (
        batch.status === BATCH_STATUSES.REJECTED ||
        (batch.status === BATCH_STATUSES.APPROVED && batchTimestamp < sevenDaysAgo)
      );
    });
    setArchivedBatches(filtered);
  }, [allBatches]); // Re-filter when allBatches changes

  return (
    <div className={styles.container}>
      <Head>
        <title>Batch Archive | BatchTrack</title>
      </Head>
      <h1>Batch Archive</h1>
      <p>Shows rejected batches and approved batches older than 7 days.</p>
      {/* Add filters here later if needed: by date range, formula, etc. */}
      <BatchTable
        batches={archivedBatches}
        // title="Archived Batches" // Title is in H1
        isLoading={loading && allBatches.length === 0} // Show loading if truly loading initial set
        error={error}
      />
    </div>
  );
};

const ArchivePage = () => (
  // For now, any authenticated user can view archive.
  // Restrict with allowedRoles if needed.
  <RoleGuard>
    <ArchivePageContent />
  </RoleGuard>
);

export default ArchivePage;