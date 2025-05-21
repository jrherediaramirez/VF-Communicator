// components/layout/Navbar.jsx
import React from 'react';
import Link from 'next/link';
import './Navbar.css'; // We'll create this CSS file next
// import { useAuth } from '../../hooks/useAuth'; // Will be used later

const Navbar = () => {
  // const { user, role } = useAuth(); // Example for later use

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link href="/" className="navbar-logo">
          BatchTrack
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link href="/" className="navbar-links">
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link href="/dashboard" className="navbar-links">
              Dashboard
            </Link>
          </li>
          {/* More links based on auth state will be added later */}
          {/* Example:
          {user ? (
            <>
              <li className="navbar-item">
                <span className="navbar-user-info">
                  {user.email} ({role})
                </span>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : (
            <li className="navbar-item">
              <Link href="/login" className="navbar-links">
                Login
              </Link>
            </li>
          )}
          */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;