import React from "react";

import AttestationPreviewer from './components/AttestationPreviewer';
import AssertionPreviewer from './components/AssertionPreviewer';

function App() {
  return (
    <div className="App" style={{ padding: 10 }}>
      <h1>WebAuthn Debugger</h1>
      <h2>Tools for debugging WebAuthn responses</h2>
      <hr/>
      <AttestationPreviewer />
      <hr/>
      <AssertionPreviewer />
    </div>
  );
}

export default App;
