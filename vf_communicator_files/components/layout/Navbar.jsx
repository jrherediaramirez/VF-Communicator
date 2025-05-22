// components/layout/Navbar.jsx
import React from 'react';
import Link from 'next/link';
import './Navbar.css';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { USER_ROLES } from '../../constants'; // Import USER_ROLES

const Navbar = () => {
  const { user, role, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
          {user && (
            <li className="navbar-item">
              <Link href="/dashboard" className="navbar-links">
                Dashboard
              </Link>
            </li>
          )}
          
          {/* Role-specific navigation */}
          {role === USER_ROLES.PROCESSOR && (
            <li className="navbar-item">
              <Link href="/batches/new" className="navbar-links">
                New Batch
              </Link>
            </li>
          )}
          
          {role === USER_ROLES.QA && (
            <li className="navbar-item">
              <Link href="/qa-queue" className="navbar-links">
                QA Queue
              </Link>
            </li>
          )}
          
          {role === USER_ROLES.ADMIN && (
            <>
              <li className="navbar-item">
                <Link href="/admin" className="navbar-links">
                  Admin Panel
                </Link>
              </li>
              <li className="navbar-item">
                <Link href="/archive" className="navbar-links">
                  Archive
                </Link>
              </li>
            </>
          )}
          
          {!loading && user ? (
            <>
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