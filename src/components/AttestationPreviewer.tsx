import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import ReactJson from 'react-json-view'

import decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import decodeAttestationObject from '../helpers/decodeAttestationObject';
import parseAuthData from '../helpers/parseAuthData';

interface Props {}

enum QUERY_PARAM {
  ATTESTATION = 'attestation',
};

const inputPlaceholder = `{
  "id": "...",
  "rawId": "...",
  "response": {
    "clientDataJSON": "...",
    "attestationObject": "..."
  },
  "type": "public-key"
}`;

const AttestationPreviewer: FunctionComponent<Props> = (props: Props) => {
  const [attestation, setAttestation] = useState<string>('');
  const [decoded, setDecoded] = useState<object>({});

  /**
   * Parse the attestation
   */
  useEffect(() => {
    if (!attestation) {
      return;
    }

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
    const authData = parseAuthData(attestationObject.authData);

    setDecoded({
      ...credential,
      response: {
        clientDataJSON,
        attestationObject: {
          ...attestationObject,
          authData,
        },
      },
    });
  }, [attestation]);

  const handleAttestationChange = useCallback((event) => {
    setAttestation(event.target.value);
  }, [setAttestation]);

  return (
    <>
      <h3>Attestation Previewer</h3>
      <h4>Input</h4>
      <textarea
        style={{ width: '100%', height: 250 }}
        value={attestation}
        onChange={handleAttestationChange}
        placeholder={inputPlaceholder}
      />
      <h4>Parsed</h4>
      <div style={{ overflowX: 'scroll' }}>
        <ReactJson
          src={decoded}
          collapseStringsAfterLength={50}
        />
      </div>
    </>
  );
};

export default AttestationPreviewer;
