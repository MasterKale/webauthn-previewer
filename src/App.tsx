import React, { useState, useCallback, useEffect } from "react";
import ReactJson from 'react-json-view'

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
  const [decoded, setDecoded] = useState<object>({});

  useEffect(() => {
    let credential;
    try {
      credential = JSON.parse(attestation);
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

    setDecoded({
      ...credential,
      response: {
        clientDataJSON,
        attestationObject,
      },
    });
  }, [attestation]);

  const handleAttestationChange = useCallback((event) => {
    setAttestation(event.target.value);
  }, [setAttestation]);

  return <div className="App">
    <h1>WebAuthn Previewer</h1>
    <hr/>
    <h2>Attestation</h2>
    <h3>Input</h3>
    <textarea
      style={{ width: '100%', height: 250 }}
      value={attestation}
      onChange={handleAttestationChange}
      placeholder={inputPlaceholder}
    />
    <h3>Parsed</h3>
    <ReactJson
      src={decoded}
      collapseStringsAfterLength={50}
    />
    <hr/>
    <h2>Assertion</h2>
    <h3>Coming Soon...?</h3>
  </div>;
}

export default App;
