/*
   This file serves as the main application layout. 
   It combines the `Sidebar` and `Main` components to form the primary user interface.
*/

import React from 'react';
import Sidebar from './components/Sidebar/Sidebar'; // Sidebar navigation component
import Main from './components/Main/Main';         // Main content area component

const App = () => {
  return (
    <>
      <Sidebar /> {/* Renders the sidebar for navigation */}
      <Main />    {/* Renders the main content of the application */}
    </>
  );
};

export default App;
