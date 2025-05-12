import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { onSent, chatSessions, setInput, newChat } = useContext(Context);

  const loadPrompt = async (prompt) => {
    setInput(prompt);
    await onSent(prompt);
  };

  return (
    <View style={styles.sidebar}>
      <View>
        {/* Menu Icon */}
        <TouchableOpacity onPress={() => setExtended((prev) => !prev)} style={styles.menuIcon}>
          <Image source={assets.menu_icon} style={styles.icon} />
        </TouchableOpacity>

        {/* New Chat Button */}
        <TouchableOpacity onPress={newChat} style={styles.newChat}>
          <Image source={assets.plus_icon} style={styles.icon} />
          {extended && <Text style={styles.text}>New Chat</Text>}
        </TouchableOpacity>

        {/* Chat Sessions */}
        {extended && (
          <ScrollView style={styles.recent}>
            <Text style={styles.recentTitle}>Recent</Text>
            {chatSessions.map((session, i) => (
              <View key={i}>
                {session.length > 0 && (
                  <>
                    {/* Folder title with message icon */}
                    <TouchableOpacity
                      onPress={() => loadPrompt(session[0])}
                      style={styles.recentEntry}
                    >
                      <Image source={assets.message_icon} style={styles.icon} />
                      <Text style={styles.text}>{session[0].slice(0, 18)}...</Text>
                    </TouchableOpacity>

                    {/* Nested prompts without icon */}
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
