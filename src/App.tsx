import React from 'react';
import './App.css';
import { ConfigEditor } from './components/ConfigEditor/ConfigEditor';
import { RecipesProvider } from './context/RecipesContext';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { ModeProvider } from './context/ModeContext';
import { Nav } from './components/common/Nav';

function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
        <RecipesProvider>
          <div className="App">
            <header className="App-header">
              <Nav />
            </header>
            <main>
              <ConfigEditor />
            </main>
            <Analytics />
          </div>
        </RecipesProvider>
      </ModeProvider>
    </ThemeProvider>
  );
}

export default App;
