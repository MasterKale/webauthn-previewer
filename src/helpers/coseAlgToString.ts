/**
 * Convert COSE public key alg to a human-friendly value
 *
 * See https://www.iana.org/assignments/cose/cose.xhtml#algorithms
 */
export default function coseAlgToString(alg: number): string {
  // TODO: There are a lot of algorithms...
  return `${alg}`;
}
