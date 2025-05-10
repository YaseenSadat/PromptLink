// // Loading.jsx
// import React from 'react';
// import logo from '../../assets/logo.png'; // adjust based on folder depth
// import './Loading.css';

// const Loading = ({
//   email,
//   password,
//   setEmail,
//   setPassword,
//   authMode,
//   setAuthMode,
//   handleAuth,
// }) => {
//   return (
//     <>
//       <div className="left-section">
//         <div className="left-content">
//           <img src={logo} alt="Logo" className="w-full h-full object-cover" />
//         </div>
//       </div>

//       <div className="right-section">
//         <div className="right-content">
//           <h2 className="text-2xl font-semibold mb-4">
//             {authMode === 'login' ? 'Welcome Back!' : 'Join Us'}
//           </h2>
//           <p className="text-gray-500 mb-6">
//             {authMode === 'login' ? 'Login to your account' : 'Create a new account'}
//           </p>

//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="input"
//           />
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="input"
//           />

//           <button onClick={handleAuth} className="submit-btn">
//             {authMode === 'login' ? 'Log In' : 'Sign Up'}
//           </button>

//           <p className="mt-4 text-sm text-center">
//             {authMode === 'login' ? (
//               <>
//                 Don't have an account?{' '}
//                 <button
//                   onClick={() => setAuthMode('signup')}
//                   className="switch-button underline"
//                 >
//                   Sign up
//                 </button>
//               </>
//             ) : (
//               <>
//                 Already have an account?{' '}
//                 <button
//                   onClick={() => setAuthMode('login')}
//                   className="switch-button underline"
//                 >
//                   Log in
//                 </button>
//               </>
//             )}
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Loading;

import React from 'react';
import './Loading.css'; // Ensure CSS is scoped or loaded here
import logo2 from '../../assets/logo2.png';

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
      <div className="left-section">
        <div className="left-content">
          <img src={logo2} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="right-section">
        <div className="right-content">
          <h2 className="text-2xl font-semibold mb-4">
            {authMode === 'login' ? 'Welcome Back!' : 'Join Us'}
          </h2>
          <p className="text-gray-500 mb-6">
            {authMode === 'login' ? 'Login to your account' : 'Create a new account'}
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          <button onClick={handleAuth} className="submit-btn">
            {authMode === 'login' ? 'Log In' : 'Signup'}
          </button>

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
    </div>
  );
};

export default Loading;
