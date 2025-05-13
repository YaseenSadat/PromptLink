// ============================================================
// Loading.jsx — Authentication screen component
//
// Displays a dual-pane login/signup UI with email and password
// input fields. Handles auth mode switching and triggers auth
// logic via props. Shows toast notifications on errors.
//
// Key responsibilities:
// 1. Render login or signup form based on `authMode`
// 2. Capture email/password inputs and call `handleAuth`
// 3. Allow switching between login and signup modes
// ============================================================

import React from 'react';
import './Loading.css'; // Ensure CSS is scoped or loaded here
import logo2 from '../../assets/logo2.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================================
// Functional component: Loading (Auth UI)
// ============================================================

const Loading = ({
  email,
  password,
  setEmail,
  setPassword,
  authMode,
  setAuthMode,
  handleAuth,
}) => {
  return (
    <div className="login-container grid grid-cols-2 min-h-screen bg-dark-blue text-light">
      
      {/* Left section: Logo image */}
      <div className="left-section">
        <div className="left-content">
          <img src={logo2} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Right section: Auth form */}
      <div className="right-section">
        <div className="right-content">
          
          {/* Header based on auth mode */}
          <h2 className="text-2xl font-semibold mb-4">
            {authMode === 'login' ? 'Welcome!' : 'Join Us!'}
          </h2>
          <p className="text-gray-500 mb-7">
            {authMode === 'login' ? 'Login to your account' : 'Create a new account'}
          </p>

          {/* Email input */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          {/* Password input */}
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          {/* Submit button */}
          <button onClick={handleAuth} className="submit-btn">
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </button>

          {/* Auth mode switch */}
          <p className="mt-4 text-sm text-center">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="switch-button underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="switch-button underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Toast notifications container */}
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Loading;