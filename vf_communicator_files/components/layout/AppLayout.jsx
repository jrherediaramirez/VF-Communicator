// components/layout/AppLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import './AppLayout.css'; // We'll create this CSS file next

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content container">
        {children}
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Batch-Tracking Inc.</p>
      </footer>
    </div>
  );
};

export default AppLayout;