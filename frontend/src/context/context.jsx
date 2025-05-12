import React, { createContext, useState } from "react";
import { marked } from 'marked';
import { assets } from '../assets/assets';

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [chatSessions, setChatSessions] = useState([[]]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastScore, setLastScore] = useState(null);

  const newChat = () => {
    setLoading(false);
    setChats([]);
    setChatSessions((prev) => [...prev, []]);
  };

  const onSent = async (prompt) => {
    setLoading(true);

    const userPrompt = prompt || input;
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
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();
      const { intent, response: aiResponse, score, model, served_from_cache } = data;

      setLastPrompt(userPrompt);
      setLastScore(score);

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

      setChats((prev) => [...prev, {
        prompt: userPrompt,
        response: finalHtml,
        intent,
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
        response: "Error: Failed to connect to the backend.",
        intent: "unknown",
        model: "unknown"
      }]);
    }

    setInput("");
    setLoading(false);
  };

  const onEnhance = async () => {
    if (!lastPrompt || lastScore >= 80) return;
    setLoading(true);
    const userPrompt = lastPrompt;

    try {
      const response = await fetch("http://localhost:8000/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();
      const { response: aiResponse, score, model } = data;

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
