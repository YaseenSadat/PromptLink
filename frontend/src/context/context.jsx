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
import runChat from "../config/openai"; // Import OpenAI API integration

// Create and export the Context to make it accessible across components
export const Context = createContext();

/**
 * ContextProvider Component
 * =========================
 * This component serves as the global state provider for the GenieAI application.
 * It maintains various states such as user input, previous prompts, and the result 
 * returned from the OpenAI API. The context value is shared with all children components.
 * 
 * @param {object} children - React components wrapped within the provider.
 * @returns {JSX.Element} - Context.Provider wrapping the application.
 */
const ContextProvider = ({ children }) => {
    // State for the current user input
    const [input, setInput] = useState("");

    // State for storing the most recent prompt sent
    const [recentPrompt, setRecentPrompt] = useState("");

    // State for storing a list of previous prompts
    const [prevPrompts, setPrevPrompts] = useState([]);

    // State for toggling the result display
    const [showResult, setShowResult] = useState(false);

    // State to indicate loading while waiting for the API response
    const [loading, setLoading] = useState(false);

    // State to store and display the formatted result data
    const [resultData, setResultData] = useState("");

    /**
     * Delays appending a word to the resultData state for dynamic typing animation.
     * @param {number} index - Index of the word in the response array.
     * @param {string} nextWord - The word to append after the delay.
     */
    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData((prev) => prev + nextWord); // Append the word to the previous state
        }, 75 * index); // Delay each word by 75ms per index
    };

    /**
     * Resets the application to start a new chat session.
     * Clears loading state and hides any existing results.
     */
    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    /**
     * Handles sending the user's prompt to the OpenAI API.
     * It updates states for loading, result display, and manages the response formatting.
     * 
     * @param {string} prompt - The user's input prompt (optional).
     */
    const onSent = async (prompt) => {
        setResultData("");       // Clear previous result data
        setLoading(true);        // Indicate loading state
        setShowResult(true);     // Show the result container

        let response;

        // Check if a prompt is passed or use the current input state
        if (prompt) {
            response = await runChat(prompt);
            setRecentPrompt(prompt);
        } else {
            setPrevPrompts((prev) => [...prev, input]); // Add the input to previous prompts
            setRecentPrompt(input);
            response = await runChat(input);
        }

        // Formatting the response: Adding bold and line breaks for better display
        const responseArray = response.split("**");
        let formattedResponse = "";

        for (let i = 0; i < responseArray.length; i++) {
            if (i % 2 === 1) {
                formattedResponse += `<b>${responseArray[i]}</b>`; // Bold words between **
            } else {
                formattedResponse += responseArray[i];
            }
        }

        // Split the response into words and animate their appearance
        const newResponseArray = formattedResponse.split("*").join("</br>").split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            delayPara(i, newResponseArray[i] + " ");
        }

        setLoading(false); // End the loading state
        setInput("");      // Clear the input field
    };

    /**
     * The value provided to the context consumers.
     * Contains the application state and utility functions.
     */
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
