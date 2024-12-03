import React from 'react';
import './App.css';
import { ConfigEditor } from './components/ConfigEditor/ConfigEditor';
import { PolicySetsProvider } from './context/PolicySetsContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { ModeToggle } from './components/common/ModeToggle';
import { Analytics } from '@vercel/analytics/react';
import { ModeProvider } from './context/ModeContext';

function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
        <PolicySetsProvider>
          <div className="App">
            <header className="App-header">
              <h1>Tail Sampling Config Generator</h1>
              <div>
                <ModeToggle />
                <ThemeToggle />
              </div>
            </header>
            <main>
              <ConfigEditor />
            </main>
            <Analytics />
          </div>
        </PolicySetsProvider>
      </ModeProvider>
    </ThemeProvider>
  );
}

export default App;
