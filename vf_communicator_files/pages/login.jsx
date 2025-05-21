// pages/login.jsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is already logged in, redirect from login page
      const returnUrl = router.query.returnUrl || '/dashboard';
      router.push(returnUrl);
    }
  }, [user, loading, router]);

  // Optional: Prevent rendering login form if already redirecting or loading
  if (loading || user) {
    return (
        <div className={styles.container}>
            <p>Loading...</p> {/* Or a spinner component */}
        </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login | BatchTrack</title>
      </Head>
      <div className={styles.container}> {/* Optional */}
        <h1>Login to BatchTrack</h1>
        <LoginForm />
      </div>
    </>
  );
};

export default LoginPage;