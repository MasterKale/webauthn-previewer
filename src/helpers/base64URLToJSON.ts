import * as base64url from "universal-base64url";

/**
 * Take a Base64URL-encoded string and convert it into human-friendly JSON
 */
export default function base64URLToJSON<T>(input: string): T {
  const buffer = base64url.decode(input);
  return JSON.parse(buffer);
}
