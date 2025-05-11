import React, { createContext, useState } from "react";

// Create and export the Context to make it accessible across components
export const Context = createContext();

const ContextProvider = ({ children }) => {
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
};

export default ContextProvider;
