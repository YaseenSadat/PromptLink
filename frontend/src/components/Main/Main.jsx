// ============================================================
// Main.jsx — Central workspace for chat interface
//
// Handles the main layout and logic for the chat UI,
// including prompt submission, displaying responses,
// session history, popovers for intent explanation,
// and model-enhanced interaction features.
//
// Key responsibilities:
// 1. Input handling and prompt dispatching
// 2. Displaying chat results and loading states
// 3. Interactive prompt suggestions (cards)
// 4. Popover with explanation for AI intent
// 5. Session logout and user dropdown
// ============================================================

import React, { useContext, useEffect, useState, useRef } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';
import { getAuth, signOut } from 'firebase/auth';
import * as Popover from '@radix-ui/react-popover';

const Main = () => {
  const {
    onSent,
    onEnhance,
    input,
    setInput,
    chats,
    loading,
  } = useContext(Context);

  const searchBoxRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showGlobalPopover, setShowGlobalPopover] = useState(false);
  const [hoveredChatIndex, setHoveredChatIndex] = useState(null);

  // =========================
  // Handle key press (Enter) to submit input
  // =========================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      onSent();
    }
  };

  // =========================
  // Handle preset card clicks
  // =========================
  const handleCardClick = (prompt) => {
    setInput(prompt);
  };

  // =========================
  // Provide explanation for intent classification
  // =========================
  const getIntentExplanation = (intent) => {
    const wrapper = (emoji, title, systemPrompt, model, reason) => (
      <>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}>{emoji} <strong>{title}</strong></p>
          <hr style={{ marginTop: '0.5rem', width: '98%', border: '1px solid #e0e0e0' }} />
        </div>
        <p>After analyzing your input using LangChain’s intent classification system, we identified your intent as <strong>"{title.toLowerCase()}"</strong></p>
        <div style={{ marginBottom: '1rem' }}></div>
        <p style={{ marginBottom: '0.5rem' }}>To help the model generate a structured, in-depth response, we prefaced your prompt with:</p>
        <p style={{ marginBottom: '1rem', textAlign: 'center' }}><em><strong>"{systemPrompt}"</strong></em></p>
        <p>The model we feel that will be best suited to give you the most effective and efficient response is <strong>"{model}"</strong> {reason}</p>
      </>
    );

    // Switch logic for different intents
    switch (intent?.toLowerCase()) {
      case 'analyze': return wrapper('🔍', 'Analyze', /* ... */ 'gemini-2.0-flash', '...');
      case 'compare': return wrapper('⚖️', 'Compare', /* ... */ 'gemini-2.0-flash', '...');
      case 'review': return wrapper('🧐', 'Review', /* ... */ 'gemini-2.0-flash', '...');
      case 'expand': return wrapper('📚', 'Expand', /* ... */ 'gemini-2.0-flash', '...');
      case 'summarize': return wrapper('✍️', 'Summarize', /* ... */ 'gpt-3.5-turbo', '...');
      case 'generate': return wrapper('💡', 'Generate', /* ... */ 'gpt-3.5-turbo', '...');
      case 'advise': return wrapper('🤝', 'Advise', /* ... */ 'gpt-3.5-turbo', '...');
      case 'edit': return wrapper('📝', 'Edit', /* ... */ 'gpt-3.5-turbo', '...');
      case 'translate': return wrapper('🌐', 'Translate', /* ... */ 'gpt-3.5-turbo', '...');
      case 'rephrase': return wrapper('🔁', 'Rephrase', /* ... */ 'gpt-3.5-turbo', '...');
      case 'outline': return wrapper('🔧', 'Outline', /* ... */ 'gpt-3.5-turbo', '...');
      case 'explain': return wrapper('📖', 'Explain', /* ... */ 'gpt-3.5-turbo', '...');
      case 'reason': return wrapper('🧮', 'Reason', /* ... */ 'gpt-3.5-turbo', '...');
      case 'code': return wrapper('👨‍💻', 'Code', /* ... */ 'gpt-4o', '...');
      default: return wrapper('🧠', 'Enhanced', '[...enhanced prompt...]', 'gpt-4o', '...');
    }
  };

  // =========================
  // Scroll to input after chat updates
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchBoxRef.current) {
        searchBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [chats, loading, input]);

  // =========================
  // Add hover listeners for chat icon popovers
  // =========================
  useEffect(() => {
    const icons = document.querySelectorAll('.icon-bottom-right img');
    icons.forEach((icon, index) => {
      icon.addEventListener('mouseenter', () => {
        setHoveredChatIndex(index);
        setShowGlobalPopover(true);
      });
      icon.addEventListener('mouseleave', () => {
        setHoveredChatIndex(null);
        setShowGlobalPopover(false);
      });
    });

    return () => {
      icons.forEach((icon) => {
        icon.replaceWith(icon.cloneNode(true)); // removes old listeners
      });
    };
  }, [chats]);

  // =========================
  // Dropdown logic
  // =========================
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // =========================
  // Firebase logout
  // =========================
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  // =========================
  // Main JSX structure
  // =========================
  return (
    <div className="main">
      {/* Navbar */}
      <div className="nav">
        <p>PromptLink</p>
        <div className="dropdown-wrapper" ref={dropdownRef}>
          <img
            src={assets.logo}
            alt="User Icon"
            className="nav-logo"
            onClick={toggleDropdown}
          />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* No chat yet — show suggestions */}
        {chats.length === 0 ? (
          <>
            <div className="greet">
              <p><span>Start typing. I’ll take it from here!</span></p>
              <p>Your intent. The right model. The perfect response.</p>
            </div>

            {/* Prompt cards */}
            <div className="cards">
              <div className="card" onClick={() => handleCardClick('Suggest beautiful places to see on an upcoming road trip')}>
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="Compass Icon" />
              </div>
              <div className="card" onClick={() => handleCardClick('Summarize this concept: urban planning')}>
                <p>Summarize this concept: urban planning</p>
                <img src={assets.bulb_icon} alt="Bulb Icon" />
              </div>
              <div className="card" onClick={() => handleCardClick('Brainstorm team bonding activities for our work retreat')}>
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="Message Icon" />
              </div>
              <div className="card" onClick={() => handleCardClick('Improve the readability of the following code')}>
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon} alt="Code Icon" />
              </div>
            </div>

            {/* Initial loading animation */}
            {loading && (
              <div className="loading-initial">
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div className="loader"><hr /><hr /><hr /></div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Chat History Display
          <div className="chat-history">
            {chats.map((chat, index) => (
              <div key={index} className="result">
                <div className="result-title">
                  <img src={assets.user_icon} alt="User Icon" />
                  <p>{chat.prompt}</p>
                </div>
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div
                    className="response-content"
                    dangerouslySetInnerHTML={{ __html: chat.response }}
                  />
                </div>
              </div>
            ))}

            {/* Floating Intent Popover */}
            <Popover.Root open={showGlobalPopover}>
              <Popover.Trigger asChild>
                <button style={{ display: 'none' }} aria-hidden="true" />
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  className="popover-content"
                  onPointerEnter={() => setShowGlobalPopover(true)}
                  onPointerLeave={() => setShowGlobalPopover(false)}
                >
                  {hoveredChatIndex !== null && chats[hoveredChatIndex] && (
                    <>
                      {getIntentExplanation(chats[hoveredChatIndex].intent)}
                      <Popover.Arrow className="popover-arrow" />
                    </>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Loading bubble */}
            {loading && (
              <div className="result">
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div className="loader"><hr /><hr /><hr /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Input + Footer Info */}
        <div className="main-bottom">
          <div className="search-box" ref={searchBoxRef}>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="Enter a prompt here"
              onKeyDown={handleKeyPress}
            />
            <div>
              {input && <img onClick={() => onSent()} src={assets.send_icon} alt="Send Icon" />}
            </div>
          </div>

          <p className="bottom-info">
            PromptLink may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>

        {/* Enhance Button */}
        <button className="enhance-btn" onClick={onEnhance}>
          Enhance Response?
        </button>
      </div>
    </div>
  );
};

export default Main;
