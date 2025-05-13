// ============================================================
// context.jsx — React context provider for prompt-based chat UI
//
// This file sets up a React Context that maintains the global
// state for chat inputs, loading status, session history, and
// backend communication for prompts and enhancements.
//
// Key responsibilities:
// 1. Manages current user input and chat history
// 2. Handles sending prompts to backend (/prompt)
// 3. Handles enhancing prompts via backend (/enhance)
// 4. Stores session-level metadata like last prompt/score
// ============================================================

import React, { createContext, useState } from "react";
import { marked } from 'marked';
import { assets } from '../assets/assets';
import { getAuth } from 'firebase/auth';

export const Context = createContext();

const ContextProvider = ({ children }) => {
  // ================================
  // State variables
  // ================================

  const [input, setInput] = useState("");                     // current input text
  const [prevPrompts, setPrevPrompts] = useState([]);         // history of prompts sent
  const [chatSessions, setChatSessions] = useState([[]]);     // session-wise prompt tracking
  const [loading, setLoading] = useState(false);              // UI loading indicator
  const [chats, setChats] = useState([]);                     // full list of chat messages
  const [lastPrompt, setLastPrompt] = useState("");           // most recent prompt
  const [lastScore, setLastScore] = useState(null);           // score returned by backend
  const auth = getAuth();                                     // Firebase auth instance
  const user = auth.currentUser;                              // current user
  const email = user?.email;                                  // user email (optional)

  // ================================
  // Create a new chat session
  // ================================

  const newChat = () => {
    setLoading(false);
    setChats([]);
    setChatSessions((prev) => [...prev, []]);
  };

  // ================================
  // Send prompt to backend (/prompt)
  // Handles classification, markdown parsing, score display
  // ================================

  const onSent = async (prompt) => {
    setLoading(true);

    const userPrompt = prompt || input;

    // Store prompt if not explicitly passed
    if (!prompt) {
      setChatSessions((prev) => {
        const updated = [...prev];
        if (updated.length === 0) updated.push([]);
        updated[updated.length - 1].push(userPrompt);
        return updated;
      });
    }

    if (!prompt) setPrevPrompts((prev) => [...prev, userPrompt]);

    try {
      const response = await fetch("http://localhost:8000/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, email }),
      });

      const data = await response.json();
      const { intent, response: aiResponse, score, model, served_from_cache } = data;

      setLastPrompt(userPrompt);
      setLastScore(score);

      // ================================
      // Convert markdown to HTML with styling
      // ================================

      const markdownSections = aiResponse.split(/```/);
      let finalHtml = "";

      for (let i = 0; i < markdownSections.length; i++) {
        if (i % 2 === 1) {
          finalHtml += `<pre class="code-block"><code class="language-javascript">${markdownSections[i]}</code></pre>`;
        } else {
          const html = marked.parse(markdownSections[i]);
          finalHtml += `<div class="markdown-text">${html}</div>`;
        }
      }

      const temp_model = String(model).toUpperCase();
      const cacheInfo = served_from_cache
        ? `<p><strong>✅ Used context-aware caching!</strong></p>`
        : "";

      // Append metadata section
      finalHtml += `
        <div class="meta-box">
          <p><strong>Score:</strong> ${score}</p>
          <p><strong>Intent:</strong> ${intent.charAt(0).toUpperCase() + intent.slice(1)}</p>
          <p><strong>Model used:</strong> ${temp_model}</p>
          ${cacheInfo}
          <div class="icon-bottom-right">
            <img src="${assets.ai_icon}" alt="AI Icon" />
          </div>
        </div>
      `;

      // Store in chat history
      setChats((prev) => [...prev, {
        prompt: userPrompt,
        response: finalHtml,
        intent,
        model: temp_model
      }]);

      // Scroll animation + syntax highlight
      setTimeout(() => {
        if (window.Prism) window.Prism.highlightAll();
        const lastChat = document.querySelector(".result:last-child");
        if (lastChat) lastChat.scrollIntoView({ behavior: "smooth" });
      }, 50);

    } catch (err) {
      console.error(err);
      setChats((prev) => [...prev, {
        prompt: userPrompt,
        response: "Error: Failed to connect to the backend.",
        intent: "unknown",
        model: "unknown"
      }]);
    }

    setInput("");
    setLoading(false);
  };

  // ================================
  // Enhance prompt via backend (/enhance)
  // Called only if lastScore is < 80
  // ================================

  const onEnhance = async () => {
    if (!lastPrompt || lastScore >= 80) return;
    setLoading(true);
    const userPrompt = lastPrompt;

    try {
      const response = await fetch("http://localhost:8000/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, email }),
      });

      const data = await response.json();
      const { response: aiResponse, score, model } = data;

      // Format enhanced response as HTML
      const markdownSections = aiResponse.split(/```/);
      let finalHtml = "";

      for (let i = 0; i < markdownSections.length; i++) {
        if (i % 2 === 1) {
          finalHtml += `<pre class="code-block"><code class="language-javascript">${markdownSections[i]}</code></pre>`;
        } else {
          const html = marked.parse(markdownSections[i]);
          finalHtml += `<div class="markdown-text">${html}</div>`;
        }
      }

      const temp_model = String(model).toUpperCase();

      finalHtml += `
        <div class="meta-box">
          <p><strong>Score:</strong> ${score}</p>
          <p><strong>Model used:</strong> ${temp_model}</p>
          <p><strong>✨ Enhanced response generated!</strong></p>
          <div class="icon-bottom-right">
            <img src="${assets.ai_icon}" alt="AI Icon" />
          </div>
        </div>
      `;

      setChats((prev) => [...prev, {
        prompt: `${userPrompt} (Enhanced)`,
        response: finalHtml,
        intent: "enhance",
        model: temp_model
      }]);

      setTimeout(() => {
        if (window.Prism) window.Prism.highlightAll();
        const lastChat = document.querySelector(".result:last-child");
        if (lastChat) lastChat.scrollIntoView({ behavior: "smooth" });
      }, 50);

    } catch (err) {
      console.error(err);
      setChats((prev) => [...prev, {
        prompt: userPrompt,
        response: "Error: Failed to connect to the backend (enhance).",
        intent: "enhance",
        model: "unknown"
      }]);
    }

    setInput("");
    setLoading(false);
  };

  // ================================
  // Expose context values to children
  // ================================

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        prevPrompts,
        setPrevPrompts,
        chats,
        loading,
        onSent,
        newChat,
        onEnhance,
        lastPrompt,
        chatSessions,
        setChatSessions,
        lastScore,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
