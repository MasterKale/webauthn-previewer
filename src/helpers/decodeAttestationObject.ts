import { decode } from "cbor-sync";

/**
 * Convert response.attestationObject to a dev-friendly format
 */
export default function decodeAttestationObject(base64urlString: string): AttestationObject {
  return decode(base64urlString, 'base64');
}

export type AttestationObject = {
  fmt: ATTESTATION_FORMATS;
  attStmt: AttestationStatement;
  authData: ArrayBuffer;
};

type AttestationStatement = {
  alg: number;
  sig: ArrayBuffer;
};

enum ATTESTATION_FORMATS {
  FIDO_U2F = "fido-u2f",
  PACKED = "packed",
  ANDROID_SAFETYNET = "android-safetynet",
  ANDROID_KEY = "android-key",
  TPM = "tpm",
  NONE = "none",
}
