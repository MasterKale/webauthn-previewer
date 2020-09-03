import base64URLToJSON from './base64URLToJSON';

/**
 * Convert response.clientDataJSON to a dev-friendly format
 */
export default function decodeClientDataJSON(base64urlString: string): ClientDataJSON {
  return base64URLToJSON<ClientDataJSON>(base64urlString);
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
