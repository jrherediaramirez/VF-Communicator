// components/auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, loginWithGoogle, authError, loading, clearAuthError } = useAuth();
  const router = useRouter();

  // Clear previous auth errors when component mounts or email/password changes
  useEffect(() => {
    if (authError) {
      clearAuthError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]); // Clear error if user starts typing again


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        alert("Please enter both email and password."); // Basic validation
        return;
    }
    const success = await loginWithEmail(email, password);
    if (success) {
      const returnUrl = router.query.returnUrl || '/dashboard';
      router.push(returnUrl);
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      const returnUrl = router.query.returnUrl || '/dashboard';
      router.push(returnUrl);
    }
  };

  return (
    <div className={styles.loginFormContainer}>
      {authError && <p className={styles.errorText}>{authError}</p>}
      <form onSubmit={handleEmailLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login with Email'}
        </button>
      </form>
      <div className={styles.divider}>OR</div>
      <button onClick={handleGoogleLogin} className={`${styles.button} ${styles.googleButton}`} disabled={loading}>
        {loading ? 'Processing...' : 'Login with Google'}
      </button>
      {/* Optional: Link to Sign Up page */}
      {/* <p className={styles.signupLink}>
        Don't have an account? <Link href="/signup">Sign Up</Link>
      </p> */}
    </div>
  );
};

export default LoginForm;