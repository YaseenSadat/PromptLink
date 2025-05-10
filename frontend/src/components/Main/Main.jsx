/*
   This file defines the main content area for the GenieAI application. 
   It interacts with the Context API to manage prompts, results, and loading states. 
   It displays greeting cards or results dynamically based on the application's state.
*/

import React, { useContext } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Main = () => {
    // Destructure state and functions from the Context API
    const { onSent, recentPrompt, showResult, loading, resultData, setInput, input } = useContext(Context);

    return (
        <div className="main">
            {/* Navigation bar with application name and user icon */}
            <div className="nav">
                <p>GenieAI</p>
                <img src={assets.user_icon} alt="User Icon" />
            </div>
            <div className="main-container">
                {!showResult ? (
                    <>
                        {/* Greeting section shown when no results are displayed */}
                        <div className="greet">
                            <p>
                                <span>Greetings!</span>
                            </p>
                            <p>How can I help you today?</p>
                        </div>
                        {/* Cards section with predefined suggestions */}
                        <div className="cards">
                            <div className="card">
                                <p>Suggest beautiful places to see on an upcoming road trip</p>
                                <img src={assets.compass_icon} alt="Compass Icon" />
                            </div>
                            <div className="card">
                                <p>Summarize this concept: urban planning</p>
                                <img src={assets.bulb_icon} alt="Bulb Icon" />
                            </div>
                            <div className="card">
                                <p>Brainstorm team bonding activities for our work retreat</p>
                                <img src={assets.message_icon} alt="Message Icon" />
                            </div>
                            <div className="card">
                                <p>Improve the readability of the following code</p>
                                <img src={assets.code_icon} alt="Code Icon" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="result">
                        {/* Result title displaying the recent prompt */}
                        <div className="result-title">
                            <img src={assets.user_icon} alt="User Icon" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="Gemini Icon" />
                            {loading ? (
                                // Loader animation while results are being fetched
                                <div className="loader">
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                            ) : (
                                // Display the AI's result dynamically
                                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                            )}
                        </div>
                    </div>
                )}
                {/* Search box for entering custom prompts */}
                <div className="main-bottom">
                    <div className="search-box">
                        <input
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            type="text"
                            placeholder="Enter a prompt here"
                        />
                        <div>
                            <img src={assets.gallery_icon} alt="Gallery Icon" />
                            <img src={assets.mic_icon} alt="Mic Icon" />
                            {input ? (
                                <img onClick={() => onSent()} src={assets.send_icon} alt="Send Icon" />
                            ) : null}
                        </div>
                    </div>
                    <p className="bottom-info">
                        GeniAI may display inaccurate info, including about people, so double-check its responses.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Main;
