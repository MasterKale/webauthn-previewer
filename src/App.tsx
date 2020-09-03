import React, { useState, useCallback } from "react";

import decodeClientDataJSON from './helpers/decodeClientDataJSON';
import decodeAttestationObject from './helpers/decodeAttestationObject';

const inputPlaceholder = `{
  "id": "...",
  "rawId": "...",
  "response": {
    "clientDataJSON": "...",
    "attestationObject": "..."
  },
  "type": "public-key"
}`;

function App() {
  const [attestation, setAttestation] = useState<string>('');
  const [decoded, setDecoded] = useState<string>('Enter an attestation above 👆');

  const handleAttestationChange = useCallback((event) => {
    const newAttestation = event.target.value;

    setAttestation(newAttestation);

    let credential;
    try {
      credential = JSON.parse(newAttestation);
    } catch (err) {
      console.warn('bad input, returning', err);
      return;
    }

    const { response } = credential;

    if (!response) {
      console.warn('missing response, returning');
      return;
    }

    if (!response.clientDataJSON || !response.attestationObject) {
      console.warn('missing clientDataJSON or attestationObject, returning');
      return;
    }

    const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
    const attestationObject = decodeAttestationObject(response.attestationObject);

    setDecoded(JSON.stringify({
      ...credential,
      response: {
        clientDataJSON,
        attestationObject,
      },
    }, null, 2));

  }, [setAttestation]);

  return <div className="App">
    <h1>WebAuthn Previewer</h1>
    <hr/>
    <h2>Attestation</h2>
    <h3>Input</h3>
    <textarea style={{ width: '100%', height: 250 }} value={attestation} onChange={handleAttestationChange} placeholder={inputPlaceholder} />
    <h3>Parsed</h3>
    <code style={{ display: 'block', marginTop: 20, border: '2px solid #EFEFEF', width: '100%', minHeight: 250 }}>
      <pre style={{ padding: 0, margin: 0 }}>{decoded}</pre>
    </code>
    <hr/>
    <h2>Assertion</h2>
    <h3>Coming Soon...?</h3>
  </div>;
}

export default App;
