export default function base64ToBase64URL(input: string): string {
  return input.replace(/\+/g, '-').replace(/\//g, '_');
}
