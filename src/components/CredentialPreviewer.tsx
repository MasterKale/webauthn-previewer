import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import ReactJson from 'react-json-view'
import { decode } from 'universal-base64url';
import { RegistrationCredentialJSON, AuthenticationCredentialJSON } from '@simplewebauthn/typescript-types';

import decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import decodeAttestationObject from '../helpers/decodeAttestationObject';
import parseAuthData from '../helpers/parseAuthData';
import parseAttestationStatement from '../helpers/parseAttestationStatement';
import updateQueryParam from '../helpers/updateQueryParam';

type Props = {}

enum QUERY_PARAM {
  RESPONSE = 'response',
};

const inputPlaceholder = `{
  "id": "...",
  "rawId": "...",
  "response": {
    ...
  },
  "type": "public-key"
}`;

type CredentialType = RegistrationCredentialJSON | AuthenticationCredentialJSON;

export const CredentialPreviewer: FunctionComponent<Props> = (props: Props) => {
  const [rawCredential, setCredential] = useState<string>('');
  const [decoded, setDecoded] = useState<object>({});
  const [error, setError] = useState<string>('');

  /**
   * Attempt to load query params on mount
   */
   useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Attestation
    const queryAttestation = searchParams.get(QUERY_PARAM.RESPONSE);
    if (queryAttestation !== null) {
      // Decode Base64URL-encoded attestation
      setCredential(decode(queryAttestation));
    }
  }, []);

  useEffect(() => {
    updateQueryParam(QUERY_PARAM.RESPONSE, rawCredential);

    setError('');

    if (!rawCredential) {
      setDecoded({});
      return;
    }

    let credential: any;
    try {
      credential = JSON.parse(rawCredential);
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

    if (isRegistrationCredential(credential)) {
      try {
        setDecoded(decodeRegistrationCredential(credential));
      } catch (err) {
        console.error(err);
        setError(`There was an error when parsing this registration credential (see console for more info): ${err}`);
      }
    } else if (isAuthenticationCredential(credential)) {
      try {
        setDecoded(decodeAuthenticationCredential(credential));
      } catch (err) {
        console.error(err);
        setError(`There was an error when parsing this authentication credential (see console for more info): ${err}`);
      }
    } else {
      setError('This JSON is unrecognizable as valid WebAuthn responses');
    }

  }, [rawCredential]);

  function handleResponseChange(event: any) {
    setCredential(event.target.value);
  }

  return (
    <>
      <h3>Registration and Authentication Response Previewer</h3>
      <h4>Input (JSON)</h4>
      <textarea
        style={{ width: '100%', height: 250 }}
        value={rawCredential}
        onChange={handleResponseChange}
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

function isRegistrationCredential(credential: any): credential is RegistrationCredentialJSON {
  if (
    credential.response
    && credential.response.clientDataJSON
    && credential.response.attestationObject
  ) {
    return true;
  }

  return false;
}

function isAuthenticationCredential(credential: any): credential is AuthenticationCredentialJSON {
  return !!(credential.response?.authenticatorData);
}

function decodeRegistrationCredential(credential: RegistrationCredentialJSON): object {
  const { response } = credential;

  if (!response.clientDataJSON || !response.attestationObject) {
    throw new Error('The "clientDataJSON" and/or "attestationObject" properties are missing from "response"');
  }

  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
  const attestationObject = decodeAttestationObject(response.attestationObject);

  const authData = parseAuthData(attestationObject.authData);
  const attStmt = parseAttestationStatement(attestationObject.attStmt);

  return {
    ...credential,
    response: {
      clientDataJSON,
      attestationObject: {
        ...attestationObject,
        attStmt,
        authData,
      },
    },
  };
}

function decodeAuthenticationCredential(credential: AuthenticationCredentialJSON): object {
  const { response } = credential;

  if (
    !response.clientDataJSON
    || !response.authenticatorData
    || !response.signature
  ) {
    throw new Error('The "clientDataJSON", "attestationObject", and/or "signature" properties are missing from "response"');
  }

  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
  const authenticatorData = parseAuthData(Buffer.from(response.authenticatorData, 'base64'));

  return {
    ...credential,
    response: {
      ...credential.response,
      authenticatorData,
      clientDataJSON,
    },
  };
}
