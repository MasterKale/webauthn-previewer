import React, { FunctionComponent, useState, useEffect } from 'react';
import ReactJson from 'react-json-view'
import { decode } from 'universal-base64url';
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';

import decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import decodeAttestationObject from '../helpers/decodeAttestationObject';
import parseAuthData from '../helpers/parseAuthData';
import parseAttestationStatement from '../helpers/parseAttestationStatement';
import updateQueryParam from '../helpers/updateQueryParam';

type Props = {}

enum QUERY_PARAM {
  CREDENTIAL = 'credential',
};

const inputPlaceholder = `{
  "id": "...",
  "rawId": "...",
  "response": {
    ...
  },
  "type": "public-key"
}`;

type DecodedCredential = {
  type: 'Registration' | 'Authentication',
  value: object,
};

export const CredentialPreviewer: FunctionComponent<Props> = (props: Props) => {
  const [rawCredential, setCredential] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedCredential | undefined>();
  const [error, setError] = useState<string>('');

  /**
   * Attempt to load query params on mount
   */
   useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Attestation
    const queryAttestation = searchParams.get(QUERY_PARAM.CREDENTIAL);
    if (queryAttestation !== null) {
      // Decode Base64URL-encoded attestation
      setCredential(decode(queryAttestation));
    }
  }, []);

  useEffect(() => {
    updateQueryParam(QUERY_PARAM.CREDENTIAL, rawCredential);

    showError('');

    if (!rawCredential) {
      return;
    }

    let credential: any;
    try {
      credential = JSON.parse(rawCredential);
    } catch (err) {
      console.warn('bad input, returning', err);
      showError("This JSON couldn't be parsed, is it valid?");
      return;
    }

    const { response } = credential;

    if (!response) {
      console.warn('missing response, returning');
      showError('The "response" property is missing from this JSON');
      return;
    }

    if (isRegistrationCredential(credential)) {
      try {
        setDecoded({
          type: 'Registration',
          value: decodeRegistrationCredential(credential),
        });
      } catch (err) {
        console.error(err);
        showError(`There was an error when parsing this registration credential (see console for more info): ${err}`);
      }
    } else if (isAuthenticationCredential(credential)) {
      try {
        setDecoded({
          type: 'Authentication',
          value: decodeAuthenticationCredential(credential),
        });
      } catch (err) {
        console.error(err);
        showError(`There was an error when parsing this authentication credential (see console for more info): ${err}`);
      }
    } else {
      showError('This JSON is unrecognizable as a valid WebAuthn response')
    }
  }, [rawCredential]);

  function handleResponseChange(event: any) {
    setCredential(event.target.value);
  }

  function showError(message: string): void {
    setError(message);
    setDecoded(undefined);
  }

  let parsedTitle = 'Parsed';
  if (decoded?.type) {
    parsedTitle = `${parsedTitle} ${decoded.type} Response`;
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
        autoComplete="off"
      />
      {error && <span style={{ color: 'red '}}>{error}</span>}
      <h4>{parsedTitle}</h4>
      <div style={{ overflowX: 'scroll' }}>
        <ReactJson
          src={decoded?.value || {}}
          collapseStringsAfterLength={50}
          collapsed={5}
          displayDataTypes={false}
        />
      </div>
    </>
  );
};

function isRegistrationCredential(credential: any): credential is RegistrationResponseJSON {
  return !!(credential.response?.attestationObject);
}

function isAuthenticationCredential(credential: any): credential is AuthenticationResponseJSON {
  return !!(credential.response?.authenticatorData);
}

function decodeRegistrationCredential(credential: RegistrationResponseJSON): object {
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
      ...response,
      clientDataJSON,
      attestationObject: {
        ...attestationObject,
        attStmt,
        authData,
      },
    },
  };
}

function decodeAuthenticationCredential(credential: AuthenticationResponseJSON): object {
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
