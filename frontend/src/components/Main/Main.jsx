import React, { useContext, useEffect, useState, useRef } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';
import { getAuth, signOut } from 'firebase/auth';


const Main = () => {
  const {
    onSent,
    input,
    setInput,
    chats,
    loading,
  } = useContext(Context);

  const searchBoxRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) { // Only trigger if input is not empty
      onSent(); // Call the onSent function
    }
  };

  // Auto-scroll to the search box whenever chats or loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchBoxRef.current) {
        searchBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500); // Adjust the delay time here (500ms in this case)

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [chats, loading, input]); // Dependencies for scrolling

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth); // ⬅️ Sign out using Firebase
  };

  return (
    <div className="main">
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
            {loading && (
              <div className="loading-initial">
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div className="loader">
                    <hr /><hr /><hr />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="chat-history">
            {chats.map((chat, index) => (
              <div key={index} className="result">
                <div className="result-title">
                  <img src={assets.user_icon} alt="User Icon" />
                  <p>{chat.prompt}</p>
                </div>
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div className="response-content" dangerouslySetInnerHTML={{ __html: chat.response }} />
                </div>
              </div>
            ))}

            {/* Separate loading indicator that appears after all existing messages */}
            {loading && (
              <div className="result">
                <div className="result-data">
                  <img src={assets.logo} alt="Gemini Icon" />
                  <div className="loader">
                    <hr /><hr /><hr />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
              {input ? (
                <img onClick={() => onSent()} src={assets.send_icon} alt="Send Icon" />
              ) : null}
            </div>
          </div>

          <p className="bottom-info">
            PromptLink may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>

        {/* Enhance button placed separately so it's anchored bottom-right */}
        <button className="enhance-btn" onClick={() => console.log("Enhance clicked")}>
          Enhance Response?
        </button>

      </div>
    </div>
  );
};

export default Main;