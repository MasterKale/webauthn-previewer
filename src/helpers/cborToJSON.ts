import * as cbor from "cbor-sync";

/**
 * Take a Base64URL-encoded CBOR object and convert it into human-friendly JSON
 */
export default function cborToJSON<T>(input: string): T {
  return cbor.decode(input, "base64");
}
