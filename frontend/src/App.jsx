/*
   This file serves as the main application layout. 
   It combines the `Sidebar` and `Main` components to form the primary user interface.
*/


import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Loading from './components/Loading/Loading';
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Or any other Prism theme
import { marked } from 'marked';

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDH74-BZSEF5s2Ko8o0asbnrhwDk_krGDg",
  authDomain: "prompt-link.firebaseapp.com",
  projectId: "prompt-link",
  storageBucket: "prompt-link.firebasestorage.app",
  messagingSenderId: "711312347665",
  appId: "1:711312347665:web:b5df0e356a6e42561157b0",
  measurementId: "G-GNY7SXJ7XJ"
};

initializeApp(firebaseConfig);
const auth = getAuth();

const App = () => {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error.message);
    }
  };

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
