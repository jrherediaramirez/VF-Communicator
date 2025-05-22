// components/layout/Navbar.jsx (snippet to add/modify for testing)
import React from 'react';
import Link from 'next/link';
import './Navbar.css';
import { useAuth } from '../../contexts/AuthContext'; // <--- IMPORT
import { useRouter } from 'next/router'; // <--- IMPORT for logout redirect

const Navbar = () => {
  const { user, role, logout, loading } = useAuth(); // <--- USE AUTH
  const router = useRouter(); // <--- USE ROUTER

  const handleLogout = async () => {
    await logout();
    router.push('/login'); // Redirect to login after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link href="/" className="navbar-logo">
          VF Connect
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link href="/" className="navbar-links">
              Home
            </Link>
          </li>
          {user && ( // Show dashboard link only if user is logged in
            <li className="navbar-item">
              <Link href="/dashboard" className="navbar-links">
                Dashboard
              </Link>
            </li>
          )}
          {/* More links based on auth state will be added later */}
          {!loading && user ? ( // <--- ADDED USER/ROLE DISPLAY AND LOGOUT
            <>
              {role === 'processor' && ( // Example role-specific link
                <li className="navbar-item">
                  <Link href="/batches/new" className="navbar-links">
                    New Batch
                  </Link>
                </li>
              )}
              <li className="navbar-item">
                <span className="navbar-user-info">
                  {user.email} ({role || 'No Role'})
                </span>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : !loading && (
            <li className="navbar-item">
              <Link href="/login" className="navbar-links">
                Login
              </Link>
            </li>
          )}
          {loading && <li className="navbar-item"><span className="navbar-user-info">Loading...</span></li>}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;