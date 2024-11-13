import React from 'react';
import './App.css';
import { ConfigEditor } from './components/ConfigEditor/ConfigEditor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>OpenTelemetry Tail Sampling Configuration Generator</h1>
      </header>
      <main>
        <ConfigEditor />
      </main>
    </div>
  );
}

export default App;
