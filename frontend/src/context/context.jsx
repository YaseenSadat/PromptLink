import React, { createContext, useState } from "react";
import { marked } from 'marked';

export const Context = createContext();

const ContextProvider = ({ children }) => {
<<<<<<< HEAD
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData((prev) => prev + nextWord);
        }, 75 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    const formatAIResponse = (text) => {
        const codeBlocks = [];
    
        // Extract and temporarily replace code blocks
        text = text.replace(/```(?:\w+)?([\s\S]*?)```/g, (_, code) => {
            codeBlocks.push(code);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });
    
        // Escape HTML and format markdown headings (###, ##)
        text = text
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/\b(Explanation|Function Definition|Documentation|Multiplication|Return Statement|Example Usage|Key Points):\b/g, '<br/><b>$1:</b>')
            .replace(/\n/g, '<br/>')
            .replace(/Score:\s*(\d+)/, '<br/><br/><b>Score:</b> $1')
            .replace(/Model used:\s*([^\n]+)/, '<br/><b>Model used:</b> $1');
    
        // Reinsert properly escaped code blocks without <br/>
        codeBlocks.forEach((code, i) => {
            const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const formatted = `<pre><code class="language-python">${escaped}</code></pre>`;
            text = text.replace(`__CODE_BLOCK_${i}__`, formatted);
        });
    
        return text;
    };
    
    
    

    const onSent = async (prompt) => {
        setResultData("");
        setLoading(true);
        setShowResult(true);

        let userPrompt = prompt || input;
        if (!prompt) {
            setPrevPrompts((prev) => [...prev, userPrompt]);
        }
        setRecentPrompt(userPrompt);

        try {
            const response = await fetch("http://localhost:8000/prompt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            const data = await response.json();
            const { response: aiResponse, score, model } = data;

            const fullText = `${aiResponse}\n\nScore: ${score}\nModel used: ${model}`;
            const formatted = formatAIResponse(fullText);

            const newResponseArray = formatted.split("*").join("</br>").split(" ");
            for (let i = 0; i < newResponseArray.length; i++) {
                delayPara(i, newResponseArray[i] + " ");
            }

        } catch (error) {
            console.error("Failed to fetch:", error);
            setResultData("❌ Failed to connect to the backend.");
        }

        setLoading(false);
        setInput("");
    };

    return (
        <Context.Provider
            value={{
                input,
                setInput,
                prevPrompts,
                setPrevPrompts,
                recentPrompt,
                setRecentPrompt,
                showResult,
                loading,
                resultData,
                onSent,
                newChat,
            }}
        >
            {children}
        </Context.Provider>
    );
=======
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
>>>>>>> origin/test4
};

export default ContextProvider;
