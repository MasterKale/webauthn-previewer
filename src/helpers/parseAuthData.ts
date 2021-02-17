import { decode } from 'cbor-sync';
import { Buffer } from 'buffer/';

import base64ToBase64URL from './base64ToBase64URL';
import aaguidToString from './aaguidToString';
import coseKeyTypeToString from './coseKeyTypeToString';
import coseAlgToString from './coseAlgToString';

enum COSEKEYS {
  kty = 1,
  alg = 3,
  crv = -1,
  x = -2,
  y = -3,
  // RSA
  mod = -1,
  exp = -2,
}

export default function parseAuthData(authData: ArrayBuffer): AuthenticatorData {
  let buffer = Buffer.from(authData);

  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);

  const flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);

  const flagsInt: number = flagsBuf[0];

  const flags = {
    userPresent: !!(flagsInt & 0x01),
    userVerified: !!(flagsInt & 0x04),
    attestedData: !!(flagsInt & 0x40),
    extensionData: !!(flagsInt & 0x80),
  };

  const counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);

  const counter = counterBuf.readUInt32BE(0);

  let aaguid: Buffer | undefined = undefined;
  let credentialID: string | undefined = undefined;
  let credentialPublicKey: ParsedCredentialPublicKey | undefined = undefined;

  if (flags.attestedData) {
    aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);

    const credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);

    const credIDLen = credIDLenBuf.readUInt16BE(0);
    let credentialIDBuffer = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);

    // Base64 to Base64URL
    credentialID = base64ToBase64URL(credentialIDBuffer.toString('base64'));

    const pubKey = decode(buffer.toString('base64'), 'base64');

    // TODO: Handle this differently if this is an RSA key
    credentialPublicKey = {
      keyType: pubKey?.[1],
    };

    if (pubKey) {
      const kty = pubKey[COSEKEYS.kty];

      credentialPublicKey.keyType = coseKeyTypeToString(kty);
      credentialPublicKey.algorithm = coseAlgToString(pubKey[COSEKEYS.alg]);

      if (kty === 3) {
        // RSA
        credentialPublicKey.modulus = Buffer.from(pubKey[COSEKEYS.mod]).toString('hex');
        credentialPublicKey.exponent = parseInt(Buffer.from(pubKey[COSEKEYS.exp]).toString('hex'), 16);
      } else {
        // Everything else
        credentialPublicKey.curve = pubKey[COSEKEYS.crv];
        credentialPublicKey.x = Buffer.from(pubKey[COSEKEYS.x]).toString('hex');
        credentialPublicKey.y = Buffer.from(pubKey[COSEKEYS.y]).toString('hex');
      }
    }
  }

  const toReturn: AuthenticatorData = {
    rpIdHash: rpIdHash.toString('hex'),
    flags,
    counter,
  };

  if (aaguid) {
    toReturn.aaguid = aaguidToString(aaguid)
  }

  if (credentialID) {
    toReturn.credentialID = credentialID;
  }

  if (credentialPublicKey) {
    toReturn.credentialPublicKey = credentialPublicKey;
  }

  return toReturn;
}

type AuthenticatorData = {
  rpIdHash: string;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    attestedData: boolean;
    extensionData: boolean;
  };
  counter: number;
  aaguid?: string;
  credentialID?: string;
  credentialPublicKey?: ParsedCredentialPublicKey;
  // extensionsDataBuffer?: Buffer;
};

type ParsedCredentialPublicKey = {
  keyType?: string;
  algorithm?: string;
  curve?: number | string;
  x?: string;
  y?: string;
  modulus?: string;
  exponent?: number;
};
