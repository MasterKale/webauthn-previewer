import { Buffer } from 'buffer/';
import { Certificate } from "@peculiar/asn1-x509";
import { decode } from 'universal-base64url';

import { AttestationStatement } from './decodeAttestationObject';
import coseAlgToString from './coseAlgToString';
import x5cToStrings from './x5cToStrings';

/**
 * Break down attestation statement properties
 */
export default function parseAttestationStatement(statement: AttestationStatement) {
  const toReturn: ParsedAttestationStatement = {};

  // Packed, TPM, AndroidKey
  if (statement.alg) {
    toReturn.alg = coseAlgToString(statement.alg);
  }

  // Packed, TPM, AndroidKey, FIDO-U2F
  if (statement.sig) {
    toReturn.sig = Buffer.from(statement.sig).toString('hex');
  }

  // Packed, TPM, AndroidKey, FIDO-U2F
  if (statement.x5c) {
    toReturn.x5c = x5cToStrings(statement.x5c);
  }

  // Android SafetyNet
  if (statement.response) {
    const jwt = statement.response.toString('utf8');
    const jwtParts = jwt.split('.');

    const header = JSON.parse(decode(jwtParts[0]));
    const payload = JSON.parse(decode(jwtParts[1]));
    const signature = jwtParts[2];

    let headerX5C = header.x5c;
    if (Array.isArray(headerX5C)) {
      const certBuffers = header.x5c.map((cert: string) => Buffer.from(cert, 'base64'));
      headerX5C = x5cToStrings(certBuffers);
    }

    toReturn.response = {
      header: {
        ...header,
        x5c: headerX5C,
      },
      payload,
      signature,
    };
  }

  // TPM, Android SafetyNet
  if (statement.ver) {
    toReturn.ver = statement.ver;
  }

  // TPM
  if (statement.certInfo) {
    // TODO: Parse this TPM data structure
    toReturn.certInfo = Buffer.from(statement.certInfo).toString('hex');
  }

  // TPM
  if (statement.pubArea) {
    // TODO: Parse this TPM data structure
    toReturn.pubArea = Buffer.from(statement.pubArea).toString('hex');
  }

  return toReturn;
}

type ParsedAttestationStatement = {
  alg?: string;
  sig?: string;
  ver?: string;
  x5c?: Certificate[];
  response?: {
    header: {
      alg: string;
      x5c: Certificate[];
    };
    payload: {
      nonce: string;
      timestampMs: number;
      apkPackageName: string;
      apkDigestSha256: string;
      ctsProfileMatch: boolean;
      apkCertificateDigestSha256: string[];
      basicIntegrity: boolean;
    };
    signature: string;
  };
  certInfo?: string;
  pubArea?: string;
};
