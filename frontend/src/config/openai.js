/*
    openai.js
    ==========
    This file integrates the OpenAI API into the GenieAI application. 
    It initializes the OpenAI client, defines configurations, and provides the `runChat` function 
    for sending user prompts to the OpenAI API and returning a styled, genie-like response.

    Key Features:
    - Connects to the OpenAI API using the GPT-3.5-turbo model.
    - Customizes responses with a predefined "genie" persona that is energetic, humorous, 
      charismatic, and informative.
    - Manages errors gracefully, providing user-friendly fallback messages.

    Dependencies:
    - `openai` library for OpenAI API communication.
    - Environment variables for secure API key storage.
*/

import OpenAI from "openai"; // Import the OpenAI client library

/**
 * Initialize the OpenAI client with API configurations.
 * 
 * - `apiKey`: The API key is securely loaded from environment variables (VITE_OPENAI_API_KEY).
 * - `dangerouslyAllowBrowser`: Enables usage of OpenAI's API in browser-based applications.
 */
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Securely retrieve API key
    dangerouslyAllowBrowser: true, // Allow API usage in browser environments
});

/**
 * Sends a user prompt to the OpenAI API and returns the styled response.
 * 
 * The response is generated using a "genie-like" personality that is:
 * - Energetic, humorous, charismatic, and fast-paced
 * - Expressive while still being informative and useful
 * 
 * @async
 * @param {string} prompt - The user's input or question to send to the AI.
 * @returns {Promise<string>} - A styled and trimmed response from the AI.
 */
const runChat = async (prompt) => {
    try {
        // Make an API request to OpenAI's chat completion endpoint
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                {
                    role: "system",
                    content: "You are a genie who is energetic, humorous, charismatic, and expressive. " +
                             "You respond to user questions quickly in a fast-paced, witty, and engaging tone. " +
                             "You also provide informative and useful answers, but always in a fun and genie-like way."
                },
                {
                    role: "user",
                    content: prompt // Send the user's input as part of the chat context
                }
            ],
            max_tokens: 300, // Limit the response to 300 tokens for concise and snappy replies
            temperature: 0.8, // Higher temperature for more creative and varied responses
        });

        // Return the trimmed AI's response content
        return response.choices[0].message.content.trim();
    } catch (error) {
        // Handle errors gracefully and log them for debugging
        console.error("Error with OpenAI API:", error);

        // Return a user-friendly error message
        return "Oops! Your wish hit a snag. Try rubbing the lamp again! 🧞‍♂️";
    }
};

export default runChat;
