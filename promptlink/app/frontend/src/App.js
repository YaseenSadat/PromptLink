// import { useState } from 'react';
// import logo from './logo.png';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import { initializeApp } from 'firebase/app';

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyDH74-BZSEF5s2Ko8o0asbnrhwDk_krGDg",
//   authDomain: "prompt-link.firebaseapp.com",
//   projectId: "prompt-link",
//   storageBucket: "prompt-link.firebasestorage.app",
//   messagingSenderId: "711312347665",
//   appId: "1:711312347665:web:b5df0e356a6e42561157b0",
//   measurementId: "G-GNY7SXJ7XJ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export default function App() {
//   const [step, setStep] = useState(1);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [authMode, setAuthMode] = useState('login');

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages([...messages, { role: 'user', content: input }, { role: 'bot', content: input }]);
//       setInput('');
//     }
//   };

//   const handleAuth = async () => {
//     try {
//       if (authMode === 'login') {
//         await signInWithEmailAndPassword(auth, email, password);
//         alert('Logged in successfully!');
//         setStep(2);
//       } else {
//         await createUserWithEmailAndPassword(auth, email, password);
//         alert('Account created successfully!');
//         setStep(2);
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-dark-blue text-light grid grid-cols-2">
//       {step === 1 ? (
//         <>
//           {/* Left Section (Logo) */}
//           <div className="left-section">
//             <div className="left-content">
//               <img src={logo} alt="Logo" className="w-full h-full object-cover" />
//             </div>
//           </div>

//           {/* Right Section (Login/Sign-Up Form) */}
//           <div className="right-section">
//             <div className="right-content">
//               <h2 className="text-2xl font-semibold mb-4">{authMode === 'login' ? 'Welcome Back!' : 'Join Us'}</h2>
//               <p className="text-gray-500 mb-6">{authMode === 'login' ? 'Login to your account' : 'Create a new account'}</p>

//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="input"
//               />
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="input"
//               />

//               <button
//                 onClick={handleAuth}
//                 className="submit-btn"
//               >
//                 {authMode === 'login' ? 'Log In' : 'Sign Up'}
//               </button>

//               <p className="mt-4 text-sm text-center">
//                 {authMode === 'login' ? (
//                   <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="switch-button underline">Sign up</button></>
//                 ) : (
//                   <>Already have an account? <button onClick={() => setAuthMode('login')} className="switch-button underline">Log in</button></>
//                 )}
//               </p>
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="flex flex-col h-screen">
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`p-3 rounded-xl max-w-xs sm:max-w-md md:max-w-lg ${
//                   msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'
//                 }`}
//               >
//                 {msg.content}
//               </div>
//             ))}
//           </div>
//           <div className="p-4 border-t bg-white flex gap-2">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring"
//             />
//             <button
//               onClick={handleSend}
//               className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




/////working version

// import { useState } from 'react';
// import logo from './logo.png';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import { initializeApp } from 'firebase/app';

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyDH74-BZSEF5s2Ko8o0asbnrhwDk_krGDg",
//   authDomain: "prompt-link.firebaseapp.com",
//   projectId: "prompt-link",
//   storageBucket: "prompt-link.firebasestorage.app",
//   messagingSenderId: "711312347665",
//   appId: "1:711312347665:web:b5df0e356a6e42561157b0",
//   measurementId: "G-GNY7SXJ7XJ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export default function App() {
//   const [step, setStep] = useState(1);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [authMode, setAuthMode] = useState('login');

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages([
//         ...messages,
//         { role: 'user', content: input },
//         { role: 'bot', content: `${input}` }
//       ]);
//       setInput('');
//     }
//   };

//   const handleAuth = async () => {
//     try {
//       if (authMode === 'login') {
//         await signInWithEmailAndPassword(auth, email, password);
//         alert('Logged in successfully!');
//         setStep(2);
//       } else {
//         await createUserWithEmailAndPassword(auth, email, password);
//         alert('Account created successfully!');
//         setStep(2);
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleLogout = () => {
//     setStep(1);
//     setEmail('');
//     setPassword('');
//     setInput('');
//     setMessages([]);
//   };

//   return (
//     <div className="min-h-screen bg-dark-blue text-light">
//       {step === 1 ? (
//         <div className="grid grid-cols-2 h-full">
//           {/* Left Section */}
//           <div className="left-section">
//             <img src={logo} alt="Logo" className="w-full h-full object-cover" />
//           </div>

//           {/* Right Section */}
//           <div className="right-section flex items-center justify-center p-10">
//             <div className="right-content w-full max-w-md">
//               <h2 className="text-2xl font-semibold mb-4">{authMode === 'login' ? 'Welcome Back!' : 'Join Us'}</h2>
//               <p className="text-gray-500 mb-6">{authMode === 'login' ? 'Login to your account' : 'Create a new account'}</p>

//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="input mb-4"
//               />
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="input mb-6"
//               />

//               <button onClick={handleAuth} className="submit-btn w-full">
//                 {authMode === 'login' ? 'Log In' : 'Sign Up'}
//               </button>

//               <p className="mt-4 text-sm text-center">
//                 {authMode === 'login' ? (
//                   <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="switch-button underline">Sign up</button></>
//                 ) : (
//                   <>Already have an account? <button onClick={() => setAuthMode('login')} className="switch-button underline">Log in</button></>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="chat-screen bg-light text-dark flex flex-col h-screen">
//           {/* Header */}
//           <div className="chat-header flex justify-between items-center p-4 border-b shadow-sm">
//             <h1 className="text-xl font-semibold">PromptLink</h1>
//             <button onClick={handleLogout} className="logout-btn">
//               Logout
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="chat-messages flex-1 overflow-y-auto p-6 space-y-4">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`message-bubble ${
//                   msg.role === 'user' ? 'user-msg ml-auto' : 'bot-msg mr-auto'
//                 }`}
//               >
//                 <p className="sender-label text-xs mb-1 font-semibold">
//                   {msg.role === 'user' ? '' : ''}
//                 </p>
//                 <p>{msg.content}</p>
//               </div>
//             ))}
//           </div>

//           {/* Input */}
//           <div className="chat-input p-4 border-t flex gap-2 bg-white">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring"
//             />
//             <button
//               onClick={handleSend}
//               className="logout-btn"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from 'react';
import logo from './logo.png';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import Main from './Main';
import { ContextProvider } from './context/context';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDH74-BZSEF5s2Ko8o0asbnrhwDk_krGDg",
  authDomain: "prompt-link.firebaseapp.com",
  projectId: "prompt-link",
  storageBucket: "prompt-link.firebasestorage.app",
  messagingSenderId: "711312347665",
  appId: "1:711312347665:web:b5df0e356a6e42561157b0",
  measurementId: "G-GNY7SXJ7XJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');

  const handleAuth = async () => {
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
        setStep(2);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
        setStep(2);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-dark-blue text-light grid grid-cols-2">
      {step === 1 ? (
        <>
          <div className="left-section">
            <div className="left-content">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="right-section">
            <div className="right-content">
              <h2 className="text-2xl font-semibold mb-4">{authMode === 'login' ? 'Welcome Back!' : 'Join Us'}</h2>
              <p className="text-gray-500 mb-6">{authMode === 'login' ? 'Login to your account' : 'Create a new account'}</p>

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
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>

              <p className="mt-4 text-sm text-center">
                {authMode === 'login' ? (
                  <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="switch-button underline">Sign up</button></>
                ) : (
                  <>Already have an account? <button onClick={() => setAuthMode('login')} className="switch-button underline">Log in</button></>
                )}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="col-span-2 relative">
          <ContextProvider> {/* ✅ Wrap Main in ContextProvider */}
            <button onClick={handleLogout} className="logout-btn absolute top-4 right-4">Logout</button>
            <Main />
          </ContextProvider>
        </div>
      )}
    </div>
  );
}
