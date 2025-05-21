// pages/batches/new.jsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BatchForm from '../../components/batch/BatchForm';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants';
import RoleGuard from '../../components/auth/RoleGuard'; // Assuming RoleGuard is created
import styles from '../../styles/Page.module.css';

const NewBatchPageContent = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Start New Batch | BatchTrack</title>
      </Head>
      <h1>Start a New Batch</h1>
      <BatchForm />
    </div>
  );
};

const NewBatchPage = () => {
  // RoleGuard will handle redirection if user is not a processor or not logged in
  return (
    <RoleGuard allowedRoles={[USER_ROLES.PROCESSOR]}>
      <NewBatchPageContent />
    </RoleGuard>
  );
};

export default NewBatchPage;