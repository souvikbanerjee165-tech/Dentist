import net from 'node:net';

/**
 * Validates URLs to prevent Server-Side Request Forgery (SSRF).
 * Blocks loopback, private IPv4/IPv6 networks, cloud metadata services, and non-HTTP protocols.
 */
export class SsrfGuard {
  // Cloud metadata and loopback IP ranges to block
  private static readonly BLOCKED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    '169.254.169.254', // AWS/GCP/Azure link-local metadata
    'metadata.google.internal',
    'instance-data',
  ]);

  /**
   * Checks if an IP address falls within private, loopback, or link-local ranges
   */
  public static isPrivateIp(ip: string): boolean {
    const isV4 = net.isIPv4(ip);
    const isV6 = net.isIPv6(ip);

    if (!isV4 && !isV6) return false;

    if (isV4) {
      const parts = ip.split('.').map(Number);
      // 127.0.0.0/8 (Loopback)
      if (parts[0] === 127) return true;
      // 10.0.0.0/8 (Private)
      if (parts[0] === 10) return true;
      // 172.16.0.0/12 (Private)
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0/16 (Private)
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0/16 (Link-local / Cloud metadata)
      if (parts[0] === 169 && parts[1] === 254) return true;
      // 0.0.0.0/8
      if (parts[0] === 0) return true;
    }

    if (isV6) {
      const lower = ip.toLowerCase();
      // ::1 Loopback
      if (lower === '::1' || lower.endsWith(':1')) return true;
      // fc00::/7 (Unique local address)
      if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
      // fe80::/10 (Link-local)
      if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
    }

    return false;
  }

  /**
   * Validates a URL string before fetching.
   * Throws Error if URL is invalid, non-http(s), or points to restricted infrastructure.
   */
  public static validateUrl(urlString: string): URL {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new Error('Invalid URL format.');
    }

    // Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Forbidden protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blacklist
    if (this.BLOCKED_HOSTS.has(hostname)) {
      throw new Error(`Access to restricted internal host "${hostname}" is blocked.`);
    }

    // Check if hostname is direct IP and if it is private
    if (this.isPrivateIp(hostname)) {
      throw new Error(`Access to private/local network IP "${hostname}" is blocked.`);
    }

    return parsed;
  }
}
