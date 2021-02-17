import { encode } from 'universal-base64url';

/**
 * Set the given query parameter to the base64url-encoded value
 */
export default function updateQueryParam(param: string, newValue: string): void {
  const searchParams = new URLSearchParams(window.location.search);

  if (newValue.length < 1) {
    // Clear query parameter if there's no value to preserve
    searchParams.delete(param);
    const newPathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newPathQuery);
  } else {
    // Set query parameter with new value
    searchParams.set(param, encode(newValue));
    const newPathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newPathQuery);
  }
}
