

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
//     <div className="min-h-screen bg-gray-100 text-gray-900">
//       {step === 1 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
//           <div className="flex flex-col items-center justify-center p-4">
//             <img src={logo} alt="Logo" className="w-32 h-32 mb-6" />
//             <button
//               onClick={() => setStep(2)}
//               className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
//             >
//               Continue as Guest
//             </button>
//           </div>
//           <div className="flex flex-col justify-center p-8 bg-white shadow-lg">
//             <h2 className="text-2xl font-semibold mb-4">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mb-3 p-2 border rounded w-full"
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mb-3 p-2 border rounded w-full"
//             />
//             <button
//               onClick={handleAuth}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
//             >
//               {authMode === 'login' ? 'Login' : 'Sign Up'}
//             </button>
//             <p className="mt-4 text-sm text-center">
//               {authMode === 'login' ? (
//                 <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-blue-600 underline">Sign up</button></>
//               ) : (
//                 <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-blue-600 underline">Login</button></>
//               )}
//             </p>
//           </div>
//         </div>
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


import { useState } from 'react';
import logo from './logo.png';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }, { role: 'bot', content: input }]);
      setInput('');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
          <div className="flex flex-col items-center justify-center p-4">
            <img src={logo} alt="Logo" className="w-32 h-32 mb-6" />
            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
            >
              Continue as Guest
            </button>
          </div>
          <div className="flex flex-col justify-center p-8 bg-white shadow-lg md:w-1/3 md:ml-auto">
            <h2 className="text-2xl font-semibold mb-4">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 p-2 border rounded w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 p-2 border rounded w-full"
            />
            <button
              onClick={handleAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            <p className="mt-4 text-sm text-center">
              {authMode === 'login' ? (
                <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-blue-600 underline">Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setAuthMode('login')} className="text-blue-600 underline">Login</button></>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-xs sm:max-w-md md:max-w-lg ${
                  msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
