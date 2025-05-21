// pages/_app.jsx
import '../styles/variables.css'; // Import variables first
import '../styles/globals.css';   // Then global styles
import AppLayout from '../components/layout/AppLayout';
import { AuthProvider } from '../contexts/AuthContext'; // We will create this next

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AuthProvider>
  );
}

export default MyApp;