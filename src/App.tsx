import React from "react";

import { CredentialPreviewer } from './components/CredentialPreviewer';

function App() {
  return (
    <div className="App" style={{ padding: 10 }}>
      <h1>WebAuthn Debugger</h1>
      <h2>Tools for debugging WebAuthn responses</h2>
      <hr/>
      <CredentialPreviewer />
    </div>
  );
}

export default App;
