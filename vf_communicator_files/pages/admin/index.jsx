// pages/admin/index.jsx
import React from 'react';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants';
import RoleGuard from '../../components/auth/RoleGuard';
import AdminPanel from '../../components/admin/AdminPanel'; // We'll create this
import styles from '../../styles/Page.module.css';

const AdminPageContent = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Panel | BatchTrack</title>
      </Head>
      <h1>Admin Panel</h1>
      <AdminPanel />
    </div>
  );
};

const AdminPage = () => (
  <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
    <AdminPageContent />
  </RoleGuard>
);

export default AdminPage;