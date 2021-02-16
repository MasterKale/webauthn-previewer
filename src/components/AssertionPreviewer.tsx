import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import ReactJson from 'react-json-view'
import { encode, decode } from 'universal-base64url';
import { AssertionCredentialJSON } from '@simplewebauthn/typescript-types';
import { Buffer } from 'buffer';

import decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import parseAuthData from '../helpers/parseAuthData';


interface Props {}

enum QUERY_PARAM {
  ASSERTION = 'assertion',
};

const inputPlaceholder = `{
  "id": "...",
  "rawId": "...",
  "response": {
    "authenticatorData": "...",
    "clientDataJSON": "...",
    "signature": "...",
    "userHandle": "..."
  },
  "type": "public-key"
}`;

const AssertionPreviewer: FunctionComponent<Props> = (props: Props) => {
  const [assertion, setAssertion] = useState<string>('');
  const [decoded, setDecoded] = useState<object>({});
  const [error, setError] = useState<string>('');

  /**
   * Attempt to load query params on mount
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Assertion
    const queryAssertion = searchParams.get(QUERY_PARAM.ASSERTION);
    if (queryAssertion !== null) {
      // Decode Base64URL-encoded assertion
      setAssertion(decode(queryAssertion));
    }
  }, []);

  /**
   * Parse the assertion
   */
  useEffect(() => {
    if (!assertion) {
      return;
    }

    // Update URL with assertion as query param
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(QUERY_PARAM.ASSERTION, encode(assertion));
    const newPathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newPathQuery);

    let credential: AssertionCredentialJSON;
    try {
      credential = JSON.parse(assertion);
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

    if (!response.clientDataJSON) {
      console.warn('missing clientDataJSON, returning');
      setError('The "clientDataJSON" property is missing from "response"');
      return;
    }

    setError('');

    try {
      const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
      const authenticatorData = parseAuthData(Buffer.from(response.authenticatorData, 'base64'));

      setDecoded({
        ...credential,
        response: {
          ...credential.response,
          authenticatorData,
          clientDataJSON,
        },
      });
    } catch (err) {
      console.error(err);
      setError(`There was an error when parsing this assertion (see console for more info): ${err}`);
    }
  }, [assertion]);

  const handleAssertionChange = useCallback((event) => {
    setAssertion(event.target.value);
  }, [setAssertion]);

  return (
    <>
      <h3>Assertion Previewer</h3>
      <h4>Input (JSON)</h4>
      <textarea
        style={{ width: '100%', height: 250 }}
        value={assertion}
        onChange={handleAssertionChange}
        placeholder={inputPlaceholder}
      />
      {error && <span style={{ color: 'red '}}>{error}</span>}
      <h4>Parsed</h4>
      <div style={{ overflowX: 'scroll' }}>
        <ReactJson
          src={decoded}
          collapseStringsAfterLength={50}
          collapsed={5}
          displayDataTypes={false}
        />
      </div>
    </>
  );
};

export default AssertionPreviewer;
