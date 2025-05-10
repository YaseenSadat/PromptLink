import { useState } from 'react';
import logo from './logo.png';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

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
    <div className="min-h-screen bg-dark-blue text-light grid grid-cols-2">
      {step === 1 ? (
        <>
          {/* Left Section (Logo) */}
          <div className="left-section">
            <div className="left-content">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right Section (Login/Sign-Up Form) */}
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

              <button
                onClick={handleAuth}
                className="submit-btn"
              >
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
