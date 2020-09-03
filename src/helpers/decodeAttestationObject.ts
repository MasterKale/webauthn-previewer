import cborToJSON from './cborToJSON';

/**
 * Convert response.attestationObject to a dev-friendly format
 */
export default function decodeAttestationObject(base64urlString: string): AttestationObjectRaw {
  const atteObjRaw = cborToJSON<AttestationObjectRaw>(base64urlString);
  return atteObjRaw;
}

export type ClientDataJSON = {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
  tokenBinding?: {
    id?: string;
    status: 'present' | 'supported' | 'not-supported';
  };
};

export type AttestationObjectRaw = {
  fmt: ATTESTATION_FORMATS;
  attStmt: AttestationStatement;
  authData: ArrayBuffer;
};

export type AttestationObject = {
  fmt: ATTESTATION_FORMATS;
  attStmt: AttestationStatement;
  authData: AuthenticatorData;
};

type AttestationStatement = {};

type AuthenticatorData = {
  rpIdHash: Buffer;
  flagsBuf: Buffer;
  flags: {
    up: boolean;
    uv: boolean;
    at: boolean;
    ed: boolean;
    flagsInt: number;
  };
  counter: number;
  counterBuf: Buffer;
  aaguid?: Buffer | undefined;
  credentialID?: Buffer | undefined;
  credentialPublicKey?: Buffer | undefined;
  extensionsDataBuffer?: Buffer | undefined;
};

enum ATTESTATION_FORMATS {
  FIDO_U2F = "fido-u2f",
  PACKED = "packed",
  ANDROID_SAFETYNET = "android-safetynet",
  ANDROID_KEY = "android-key",
  TPM = "tpm",
  NONE = "none",
}
