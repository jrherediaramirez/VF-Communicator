// pages/qa-queue.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants';
import RoleGuard from '../components/auth/RoleGuard';
import BatchTable from '../components/batch/BatchTable';
import { getQAQueueBatches } from '../lib/firebase/firestore';
import styles from '../styles/Page.module.css';

const QAQueuePageContent = () => {
  const [qaBatches, setQaBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getQAQueueBatches(
      (batches) => {
        setQaBatches(batches);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load QA queue.');
        setLoading(false);
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>QA Queue | BatchTrack</title>
      </Head>
      <h1>QA Queue (Awaiting QA Decision)</h1>
      {loading && <p>Loading QA queue...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <BatchTable batches={qaBatches} title="Batches Awaiting QA" />
      )}
    </div>
  );
};

const QAQueuePage = () => (
  <RoleGuard allowedRoles={[USER_ROLES.QA]}>
    <QAQueuePageContent />
  </RoleGuard>
);

export default QAQueuePage;