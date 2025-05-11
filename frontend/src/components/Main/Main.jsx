// /*
//    This file defines the main content area for the GenieAI application. 
//    It interacts with the Context API to manage prompts, results, and loading states. 
//    It displays greeting cards or results dynamically based on the application's state.
// */


import React, { useContext } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Main = () => {
  const {
    onSent,
    input,
    setInput,
    chats,
    loading,
  } = useContext(Context);

  return (
    <div className="main">
      <div className="nav">
        <p>PromptLink</p>
        <img src={assets.logo} alt="User Icon" />
      </div>
      <div className="main-container">
        {chats.length === 0 ? (
          <>
            <div className="greet">
              <p><span>Greetings!</span></p>
              <p>How can I help you today?</p>
            </div>
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
          chats.map((chat, index) => (
            <div key={index} className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="User Icon" />
                <p>{chat.prompt}</p>
              </div>
              <div className="result-data">
                <img src={assets.logo} alt="Gemini Icon" />
                {loading && index === chats.length - 1 ? (
                  <div className="loader">
                    <hr /><hr /><hr />
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: chat.response }} />
                )}
              </div>
            </div>
          ))
        )}
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
            PromptLink may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
