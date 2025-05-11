/*
   Sidebar.jsx (React Native Web)
   ==============================
   This component renders a sidebar for the GenieAI application. It provides navigation functionality 
   for creating new chats, and viewing recent prompts
   Key Features:
   - Top Section: Includes a toggleable menu and a "New Chat" button.
   - Middle Section: Displays a list of recent prompts when extended.

   Dependencies:
   - React Native Web components (`View`, `Text`, `TouchableOpacity`, `Image`, etc.) for UI rendering.
   - Context API for managing global state and interacting with prompts.
   - Assets for icons (imported from a centralized assets file).

   Styling:
   - Uses React Native's `StyleSheet` API for consistent and maintainable styles.
*/

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { assets } from '../../assets/assets'; // Asset paths for icons
import { Context } from '../../context/context'; // Global Context for state management

/**
 * Sidebar Component
 * ==================
 * Provides a sidebar UI for navigation, recent prompts, and bottom menu items.
 * 
 * Features:
 * - Toggleable sidebar that expands to show additional text (e.g., "New Chat", "Help").
 * - Displays a list of previous prompts.
 * 
 * @returns {JSX.Element} - Sidebar component with top, middle, and bottom sections.
 */
const Sidebar = () => {
    const [extended, setExtended] = useState(false); // State to toggle sidebar expansion
    const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context); // Access global state and functions

    /**
     * Loads a previously used prompt into the main input and sends it to the API.
     * @param {string} prompt - The user's previously entered prompt.
     */
    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt); // Update the recent prompt
        await onSent(prompt);    // Trigger API call with the prompt
    };

    return (
        <View style={styles.sidebar}>
            {/* Top Section: Menu toggle and New Chat button */}
            <View>
                {/* Menu Icon */}
                <TouchableOpacity onPress={() => setExtended((prev) => !prev)} style={styles.menuIcon}>
                    <Image source={assets.menu_icon} style={styles.icon} />
                </TouchableOpacity>

                {/* New Chat Button */}
                <TouchableOpacity onPress={() => newChat()} style={styles.newChat}>
                    <Image source={assets.plus_icon} style={styles.icon} />
                    {extended && <Text style={styles.text}>New Chat</Text>}
                </TouchableOpacity>

                {/* Recent Prompts Section */}
                {extended && (
                    <ScrollView style={styles.recent}>
                        <Text style={styles.recentTitle}>Recent</Text>
                        {prevPrompts.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => loadPrompt(item)} // Load and send the selected prompt
                                style={styles.recentEntry}
                            >
                                <Image source={assets.message_icon} style={styles.icon} />
                                <Text style={styles.text}>{item.slice(0, 18)}...</Text> {/* Truncate prompt */}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    /* Sidebar Container */
    sidebar: {
        backgroundColor: 'black',
        height: '100vh', /* Full viewport height */
        paddingVertical: 25,
        paddingHorizontal: 15,
        justifyContent: 'space-between', /* Push content to top and bottom */
    },

    /* Menu Icon Styling */
    menuIcon: {
        marginBottom: 30,
        alignItems: 'center',
    },

    /* New Chat Button Styling */
    newChat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, /* Space between icon and text */
        padding: 12,
        backgroundColor: '#40747c',
        borderRadius: 25,
        marginBottom: 40, /* Space below New Chat button */
    },

    /* Recent Prompts Section */
    recent: {
        marginTop: 20,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recentEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderRadius: 25,
    },



    /* Icon Styling */
    icon: {
        width: 20,
        height: 20,
    },

    /* Text Styling */
    text: {
        fontSize: 14,
        color: 'white',
    },
});

export default Sidebar;
