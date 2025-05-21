// lib/firebase/auth.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // Optional: if you want a sign-up function
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from './config'; // Your Firebase config from Step 0

const googleProvider = new GoogleAuthProvider();

/**
 * Signs in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error signing in with email and password:", error);
    throw error;
  }
};

/**
 * Signs in a user with Google.
 * Note: Ensure Google Sign-In is enabled in your Firebase project
 * and necessary OAuth redirect URIs are configured if deploying.
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    // You might want to check if the user is new and set up their profile/role here
    // if custom claims aren't immediately available or need to be triggered.
    return userCredential;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    // Handle specific errors like 'auth/popup-closed-by-user'
    throw error;
  }
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Optional: Signs up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // After sign-up, you might want to trigger setting a default role via a Cloud Function.
    return userCredential;
  } catch (error) {
    console.error("Error signing up with email and password:", error);
    throw error;
  }
};

/**
 * Listens for authentication state changes and fetches custom claims.
 * @param {function} callback - ({ user, role, loading }) => void
 * @returns {Unsubscribe} Firebase unsubscribe function.
 */
export const onAuthStateChangedWrapper = (callback) => {
  return onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      try {
        // Force refresh to get the latest claims if they were just set
        const idTokenResult = await authUser.getIdTokenResult(true);
        const role = idTokenResult.claims.role || null; // Access your custom role claim
        callback({ user: authUser, role: role, loading: false });
      } catch (error) {
        console.error("Error fetching ID token result:", error);
        // Fallback if token fetching fails, user is still authenticated
        callback({ user: authUser, role: null, loading: false });
      }
    } else {
      callback({ user: null, role: null, loading: false });
    }
  }, (error) => {
    // Handle errors during listener setup (rare)
    console.error("Error in onAuthStateChanged listener:", error);
    callback({ user: null, role: null, loading: false, error: error });
  });
};