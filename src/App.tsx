import React from "react";

import AttestationPreviewer from './components/AttestationPreviewer';

function App() {
  return (
    <div className="App" style={{ padding: 10 }}>
      <h1>WebAuthn Debugger</h1>
      <h2>Tools for debugging WebAuthn responses</h2>
      <hr/>
      <AttestationPreviewer />
      <hr/>
      <h3>Assertion</h3>
      <h4>Coming Soon...?</h4>
    </div>
  );
}

export default App;
