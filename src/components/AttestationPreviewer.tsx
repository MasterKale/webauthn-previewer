import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import ReactJson from 'react-json-view'
import { encode, decode } from 'universal-base64url';

import decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import decodeAttestationObject from '../helpers/decodeAttestationObject';
import parseAuthData from '../helpers/parseAuthData';
import parseAttestationStatement from '../helpers/parseAttestationStatement';

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
  const [error, setError] = useState<string>('');

  /**
   * Attempt to load query params on mount
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Attestation
    const queryAttestation = searchParams.get(QUERY_PARAM.ATTESTATION);
    if (queryAttestation !== null) {
      // Decode Base64URL-encoded attestation
      setAttestation(decode(queryAttestation));
    }
  }, []);

  /**
   * Parse the attestation
   */
  useEffect(() => {
    if (!attestation) {
      return;
    }

    // Update URL with attestation as query param
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(QUERY_PARAM.ATTESTATION, encode(attestation));
    const newPathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newPathQuery);

    let credential;
    try {
      credential = JSON.parse(attestation);
    } catch (err) {
      console.warn('bad input, returning', err);
      setError("This JSON couldn't be parsed, is it valid?");
      return;
    }

    const { response } = credential;

    if (!response) {
      console.warn('missing response, returning');
      setError('The "response" property is missing from this JSON');
      return;
    }

    if (!response.clientDataJSON || !response.attestationObject) {
      console.warn('missing clientDataJSON or attestationObject, returning');
      setError('The "clientDataJSON" and/or "attestationObject" properties are missing from "response"');
      return;
    }

    setError('');

    try {
      const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
      const attestationObject = decodeAttestationObject(response.attestationObject);
      const authData = parseAuthData(attestationObject.authData);
      const attStmt = parseAttestationStatement(attestationObject.attStmt);

      setDecoded({
        ...credential,
        response: {
          clientDataJSON,
          attestationObject: {
            ...attestationObject,
            attStmt,
            authData,
          },
        },
      });
    } catch (err) {
      console.error(err);
      setError(`There was an error when parsing this attestation (see console for more info): ${err}`);
    }
  }, [attestation]);

  const handleAttestationChange = useCallback((event) => {
    setAttestation(event.target.value);
  }, [setAttestation]);

  return (
    <>
      <h3>Attestation Previewer</h3>
      <h4>Input (JSON)</h4>
      <textarea
        style={{ width: '100%', height: 250 }}
        value={attestation}
        onChange={handleAttestationChange}
        placeholder={inputPlaceholder}
      />
      {error && <span style={{ color: 'red '}}>{error}</span>}
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
