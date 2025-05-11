/*
    context.jsx
    ============
    This file creates a Context for managing the global state of the GenieAI application. 
    It provides a `ContextProvider` component that encapsulates the app's state logic and 
    makes it available to all child components.

    Key Features:
    - Manages user input, recent prompts, loading state, and AI-generated responses.
    - Provides utility functions to send prompts to the OpenAI API and handle responses.
    - Dynamically formats and animates the AI-generated responses for better presentation.

    Dependencies:
    - React's Context API for global state management.
    - `runChat` function from OpenAI configuration for sending user prompts to the AI.
*/

import React, { createContext, useState } from "react";
import { marked } from 'marked';

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);

  const newChat = () => {
    setLoading(false);
    setChats([]); // clear previous chats
  };

  const onSent = async (prompt) => {
    setLoading(true);

    const userPrompt = prompt || input;
    if (!prompt) setPrevPrompts((prev) => [...prev, userPrompt]);

    try {
      const response = await fetch("http://localhost:8000/prompt", {
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
        </div>
      `;

      setChats((prev) => [...prev, { prompt: userPrompt, response: finalHtml }]);

      setTimeout(() => {
        if (window.Prism) window.Prism.highlightAll();
        const lastChat = document.querySelector(".result:last-child");
        if (lastChat) lastChat.scrollIntoView({ behavior: "smooth" });
      }, 50);

    } catch (err) {
      console.error(err);
      setChats((prev) => [...prev, {
        prompt: userPrompt,
        response: "Error: Failed to connect to the backend."
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;