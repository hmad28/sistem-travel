/** Use the Host routed by the deployment, never a caller-supplied Origin,
 * Referer or X-Forwarded-Host. Vercel routes Host to this project.
 * A self-hosted reverse proxy must enforce the same host boundary. */
export function requestOrigin(headers: Pick<Headers, 'get'>): string {
  const host = headers.get('host');
  if (!host || host !== host.trim() || /[\s,/@\\?#]/.test(host)) throw new Error('Invalid request host');
  const url = new URL(`https://${host}`);
  if (url.host.toLowerCase() !== host.toLowerCase() || !url.hostname) throw new Error('Invalid request host');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (local && headers.get('x-forwarded-proto') !== 'https') url.protocol = 'http:';
  return url.origin;
}
