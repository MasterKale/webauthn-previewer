import { decode } from "universal-base64url";

/**
 * Convert response.clientDataJSON to a dev-friendly format
 */
export default function decodeClientDataJSON(base64urlString: string): ClientDataJSON {
  return JSON.parse(decode(base64urlString));
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
