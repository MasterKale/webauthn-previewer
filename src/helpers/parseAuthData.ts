import { decode } from 'cbor-sync';
import { Buffer } from 'buffer/';

import base64ToBase64URL from './base64ToBase64URL';

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
    let x;
    let y;
    if (pubKey) {
      if (pubKey[-2]) {
        x = Buffer.from(pubKey[-2]).toString('hex');
      }

      if (pubKey[-3]) {
        y = Buffer.from(pubKey[-3]).toString('hex');
      }
    }

    credentialPublicKey = {
      keyType: pubKey?.[1],
      algorithm: pubKey?.[3],
      curve: pubKey?.[-1],
      x,
      y,
    };
  }

  return {
    rpIdHash,
    flags,
    counter,
    aaguid,
    credentialID,
    credentialPublicKey,
  };
}

type AuthenticatorData = {
  rpIdHash: Buffer;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    attestedData: boolean;
    extensionData: boolean;
  };
  counter: number;
  aaguid?: Buffer;
  credentialID?: string;
  credentialPublicKey?: ParsedCredentialPublicKey;
  // extensionsDataBuffer?: Buffer;
};

type ParsedCredentialPublicKey = {
  keyType?: number;
  algorithm?: number;
  curve?: Buffer;
  x?: string;
  y?: string;
};
