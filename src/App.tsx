import React, { useState, useCallback } from "react";

import decodeClientDataJSON from './helpers/decodeClientDataJSON';
import decodeAttestationObject from './helpers/decodeAttestationObject';

const originalAttestation = JSON.stringify({
  id: "QdiHnAdxCTeVpw2Up2QYdbTG1fQFLwfdELRHvyyZg10",
  rawId: "QdiHnAdxCTeVpw2Up2QYdbTG1fQFLwfdELRHvyyZg10",
  response: {
    attestationObject:
      "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBZ9Ukck8V92UT5YFZtBoVSQZWyFTM-rDMTOAW1DLfg1hnRQAAAAAAAAAAAAAAAAAAAAAAAAAAACBB2IecB3EJN5WnDZSnZBh1tMbV9AUvB90QtEe_LJmDXaQBAwM5AQAgWQEAycssl7oWfq6Kl9I_CUlJAMDvgR_ikvp6ugJxuQCTlmJ399AzoenJMrN_GcudcIdVviopUwTIipVZfsXrHRShZXh9hoSwt6Hxc8hYy2fHsOOhYeQ1k7pheZD_U_obAkuZa31I_0EqkkTAEgKJ0MIw0NQKQcL9SvqB0cvowj1j_mAfgEc519SDSqtfUkeX8if36Y10jJPok-ieczFKAQn5V_0VhSAoCUXM9gsNArOo2K8BxU8N5gwFWnJIYIkEHQBxO2IC4w5W14wftU1Ysh0kzNWFSAR4obKmUVZMSr04pHu-3bd_aHadTd9zCUtrmFB3bHkCgOYidpYNpy0xLiJDWSFDAQAB",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiLThHZXZjMzVlOVlremxvY05DbjhxRWdMN1ZLZDZSeDlac3NsTkw4SWE2QSIsIm9yaWdpbiI6Imh0dHBzOi8vZGV2Lm5ldHBhc3Nwb3J0LmlvIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
  },
  type: "public-key",
}, null, 2);

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
    <h1>WebAuthn Attestation Previewer</h1>
    <h2>Input</h2>
    <textarea style={{ width: '100%', height: 250 }} value={attestation} onChange={handleAttestationChange} placeholder={inputPlaceholder} />
    <h2>Parsed</h2>
    <code style={{ display: 'block', marginTop: 20, border: '2px solid #EFEFEF', width: '100%', minHeight: 250 }}>
      <pre style={{ padding: 0, margin: 0 }}>{decoded}</pre>
    </code>
  </div>;
}

export default App;
