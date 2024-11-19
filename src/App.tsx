import React from 'react';
import './App.css';
import { ConfigEditor } from './components/ConfigEditor/ConfigEditor';
import { PolicySetsProvider } from './context/PolicySetsContext';

function App() {
  return (
    <div className="App">
      <PolicySetsProvider>
        <header className="App-header">
          <h1>OpenTelemetry Tail Sampling Configuration Generator</h1>
        </header>
        <main>
          <ConfigEditor />
        </main>
      </PolicySetsProvider>
    </div>
  );
}

export default App;
