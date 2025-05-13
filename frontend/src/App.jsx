/*
   App.jsx: This file serves as the main application layout. 
   It combines the `Sidebar` and `Main` components to form the primary user interface.
   It also handles Firebase authentication and routing to the Loading screen.
*/

// ============================================================
// Imports
// ============================================================

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Loading from './components/Loading/Loading';
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Or any other Prism theme
import { toast } from 'react-toastify';

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// ============================================================
// Firebase Configuration
// Reads environment variables for sensitive config values
// ============================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}; 

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

// ============================================================
// Main App Component
// Handles Firebase authentication and renders layout
// ============================================================

const App = () => {
  // ==========================================================
  // Local state for user authentication and auth form fields
  // ==========================================================

  const [user, setUser] = useState(null);               // current authenticated user
  const [authMode, setAuthMode] = useState('login');    // 'login' or 'signup'
  const [email, setEmail] = useState('');               // user email input
  const [password, setPassword] = useState('');         // user password input

  // ==========================================================
  // Subscribe to Firebase auth state changes
  // ==========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // cleanup on unmount
  }, []);

  // ==========================================================
  // Handle login or signup based on current authMode
  // Shows toast notifications on error
  // ==========================================================

  const handleAuth = async () => {
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      if (authMode === 'login') {
        toast.error("Incorrect email or password.");
      } else if (authMode === 'signup') {
        if (error.code === 'auth/email-already-in-use') {
          toast.error("User already exists. Please log in.");
        } else if (error.code === 'auth/weak-password') {
          toast.error("Password is too weak. Minimum 6 characters.");
        } else {
          toast.error("Signup failed. Please try again.");
        }
      }
    }
  };

  // ==========================================================
  // If no authenticated user, show Loading (auth screen)
  // ==========================================================

  if (!user) {
    return (
      <Loading
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleAuth={handleAuth}
      />
    );
  }

  // ==========================================================
  // Main application layout with Sidebar and Main components
  // ==========================================================

  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="main-wrapper">
        <Main />
      </div>
    </div>
  );
};

export default App;
