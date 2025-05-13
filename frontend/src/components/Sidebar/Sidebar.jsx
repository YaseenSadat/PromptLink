// ============================================================
// Sidebar.jsx — Collapsible navigation panel for chat history
//
// This component renders the sidebar UI, including the menu
// toggle, new chat button, and a scrollable list of previous
// prompt sessions. Allows quick prompt re-submission.
//
// Key functionalities:
// 1. Toggle extended sidebar view
// 2. Start a new chat session
// 3. Display and reload recent prompt sessions
// ============================================================

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Sidebar = () => {
  const [extended, setExtended] = useState(false);                            // Controls sidebar expansion
  const { onSent, chatSessions, setInput, newChat } = useContext(Context);   // Access shared context

  // ============================================================
  // Load a past prompt into the input and resend it
  // ============================================================

  const loadPrompt = async (prompt) => {
    setInput(prompt);
    await onSent(prompt);
  };

  return (
    <View style={styles.sidebar}>
      <View>
        {/* Toggle Sidebar Expansion */}
        <TouchableOpacity onPress={() => setExtended((prev) => !prev)} style={styles.menuIcon}>
          <Image source={assets.menu_icon} style={styles.icon} />
        </TouchableOpacity>

        {/* Start New Chat */}
        <TouchableOpacity onPress={newChat} style={styles.newChat}>
          <Image source={assets.plus_icon} style={styles.icon} />
          {extended && <Text style={styles.text}>New Chat</Text>}
        </TouchableOpacity>

        {/* Show Previous Chat Sessions */}
        {extended && (
          <ScrollView style={styles.recent}>
            <Text style={styles.recentTitle}>Recent</Text>
            {chatSessions.map((session, i) => (
              <View key={i}>
                {session.length > 0 && (
                  <>
                    {/* First prompt of session as folder title */}
                    <TouchableOpacity
                      onPress={() => loadPrompt(session[0])}
                      style={styles.recentEntry}
                    >
                      <Image source={assets.message_icon} style={styles.icon} />
                      <Text style={styles.text}>{session[0].slice(0, 18)}...</Text>
                    </TouchableOpacity>

                    {/* Remaining prompts in session (indented) */}
                    {session.slice(1).map((prompt, j) => (
                      <TouchableOpacity
                        key={j}
                        onPress={() => loadPrompt(prompt)}
                        style={[styles.recentEntry, styles.nestedPrompt]}
                      >
                        <Text style={styles.text}>{prompt.slice(0, 18)}...</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// ============================================================
// Stylesheet for Sidebar component (React Native)
// ============================================================

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: 'black',
    height: '100vh',
    paddingVertical: 25,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  menuIcon: {
    marginBottom: 30,
    alignItems: 'center',
  },
  newChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#40747c',
    borderRadius: 25,
    marginBottom: 40,
  },
  recent: {
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  recentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderRadius: 25,
  },
  nestedPrompt: {
    marginLeft: 28, // visually indents child prompts
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 14,
    color: 'white',
  },
});

export default Sidebar;