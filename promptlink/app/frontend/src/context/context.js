import { createContext, useState } from 'react';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  const [recentPrompt, setRecentPrompt] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState('');

  const onSent = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(input);

    setTimeout(() => {
      setResultData(`You asked: "${input}". Here's a simulated AI response.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <Context.Provider value={{
      onSent,
      input,
      setInput,
      recentPrompt,
      showResult,
      loading,
      resultData
    }}>
      {children}
    </Context.Provider>
  );
};
