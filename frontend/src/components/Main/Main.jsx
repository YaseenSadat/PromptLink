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
  
    switch (intent?.toLowerCase()) {
      case 'analyze':
        return wrapper('🔍', 'Analyze', 'You are a critical analyst. Provide a detailed analysis of the following topic, identifying causes, effects, and implications.', 'gemini-2.0-flash', 'due to its high-speed reasoning capabilities and strong performance in analytical breakdowns.');
      case 'compare':
        return wrapper('⚖️', 'Compare', 'You are a helpful assistant. Provide a clear side-by-side comparison of the following options.', 'gemini-2.0-flash', 'due to its ability to present structured, clear comparisons with speed and accuracy.');
      case 'review':
        return wrapper('🧐', 'Review', 'You are a critical reviewer. Offer a balanced and insightful critique of the following.', 'gemini-2.0-flash', 'due to its nuanced evaluative abilities and efficiency in delivering thoughtful feedback.');
      case 'expand':
        return wrapper('📚', 'Expand', 'You are a thoughtful writer. Expand on the following idea with additional details, examples, or explanations.', 'gemini-2.0-flash', 'due to its strength in elaborating on ideas with depth and clarity while remaining fast and cost-effective.');
      case 'summarize':
        return wrapper('✍️', 'Summarize', 'You are a professional summarizer. Create a concise and accurate summary of the following content in bullet points or a paragraph.', 'gpt-3.5-turbo', 'due to its speed, reliability, and ability to distill information effectively without the resource demands of more complex models.');
      case 'generate':
        return wrapper('💡', 'Generate', 'You are a creative content generator. Use an engaging and original tone to generate content based on this prompt.', 'gpt-3.5-turbo', 'due to its fast generation times and strong creative capabilities for general-purpose content.');
      case 'advise':
        return wrapper('🤝', 'Advise', 'You are a helpful and thoughtful advisor. Offer practical, clear, and empathetic advice for the following question or situation.', 'gpt-3.5-turbo', 'due to its conversational tone and balanced guidance tailored to user needs.');
      case 'edit':
        return wrapper('📝', 'Edit', 'You are a professional editor. Improve the grammar, clarity, and tone of the following text without changing its meaning.', 'gpt-3.5-turbo', 'due to its consistency and fluency in grammar correction and stylistic refinement.');
      case 'translate':
        return wrapper('🌐', 'Translate', 'You are a fluent translator. Translate the following text to fluent English while keeping original tone and context.', 'gpt-3.5-turbo', 'due to its multilingual capabilities and fast processing of basic translation tasks.');
      case 'rephrase':
        return wrapper('🔁', 'Rephrase', 'You are a skilled rewriter. Paraphrase the following content in a new tone or style while preserving the original meaning.', 'gpt-3.5-turbo', 'due to its proficiency in rewording while keeping context and clarity intact.');
      case 'outline':
        return wrapper('🔧', 'Outline', 'You are a structured thinker. Convert the following ideas into a clear, organized outline.', 'gpt-3.5-turbo', 'due to its logical structure and concise formatting skills.');
      case 'explain':
        return wrapper('📖', 'Explain', 'You are a skilled technical educator. Break down the following concept clearly and simply for a beginner audience.', 'gpt-3.5-turbo', 'due to its strength in simplifying complex ideas for a general audience.');
      case 'reason':
        return wrapper('🧮', 'Reason', 'You are a logical AI designed for step-by-step reasoning. Solve or evaluate the following situation by explaining each step clearly.', 'gpt-3.5-turbo', 'due to its reliability in handling logical sequences without unnecessary complexity.');
      case 'code':
        return wrapper('👨‍💻', 'Code', 'You are an expert software engineer. Write clean, efficient, and well-commented code to solve the following problem:', 'gpt-4o', 'due to its advanced coding abilities, multilingual language support, and detailed comment generation that enhances code readability and utility.');
      default:
        return wrapper('🧠', 'Enhanced', '[The additonal prompt based off intent] + Ensure your response is over 150 words (different prompt for answers which should be short), includes many keywords from the input, is written with high clarity using short, readable sentences, uses step-by-step reasoning when appropriate, and closely matches the intended meaning to maximize semantic similarity.', 'gpt-4o', 'due to its general-purpose excellence across diverse tasks and its ability to handle ambiguous input with advanced reasoning.');
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