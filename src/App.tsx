import React from 'react';
import './App.css';
import { ConfigEditor } from './components/ConfigEditor/ConfigEditor';
import { PolicySetsProvider } from './context/PolicySetsContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <PolicySetsProvider>
        <div className="App">
          <header className="App-header">
            <h1>OpenTelemetry Tail Sampling Configuration Generator</h1>
            <ThemeToggle />
          </header>
          <main>
            <ConfigEditor />
          </main>
        </div>
      </PolicySetsProvider>
    </ThemeProvider>
  );
}

export default App;
