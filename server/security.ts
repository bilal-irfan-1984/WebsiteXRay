import { URL } from 'url';

/**
 * Normalizes input string to a standard URL format
 */
export function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Wrong link: URL cannot be empty. Please enter a website address.');
  }

  // If missing protocol, prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();
    // Default to root path if empty
    if (!parsed.pathname) {
      parsed.pathname = '/';
    }
    return parsed.toString();
  } catch {
    throw new Error('Wrong link: Invalid URL format. Please provide a valid website address (e.g. example.com or https://example.com)');
  }
}

/**
 * SSRF and Malicious URL protection
 * Rejects localhost, private IP ranges, link-local, cloud metadata IPs, non-http protocols.
 */
export function validateSafePublicUrl(normalizedUrl: string): { isValid: boolean; reason?: string; hostname?: string } {
  try {
    const parsed = new URL(normalizedUrl);

    // Only allow http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Wrong link: Only HTTP and HTTPS protocols are supported.' };
    }

    const host = parsed.hostname;

    // Check for localhost or local domains
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan')
    ) {
      return { isValid: false, reason: 'Wrong link: Local and internal hostnames cannot be audited.' };
    }

    // Check IPv4 private and link-local ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (match) {
      const [, p1, p2] = match.map(Number);
      // 127.0.0.0/8 Loopback
      if (p1 === 127) return { isValid: false, reason: 'Wrong link: Loopback IP addresses (127.x.x.x) are prohibited.' };
      // 0.0.0.0/8
      if (p1 === 0) return { isValid: false, reason: 'Wrong link: Invalid IP address.' };
      // 10.0.0.0/8 Private
      if (p1 === 10) return { isValid: false, reason: 'Wrong link: Private IP addresses (10.x.x.x) are prohibited.' };
      // 172.16.0.0/12 Private
      if (p1 === 172 && p2 >= 16 && p2 <= 31) return { isValid: false, reason: 'Wrong link: Private IP addresses (172.16-31.x.x) are prohibited.' };
      // 192.168.0.0/16 Private
      if (p1 === 192 && p2 === 168) return { isValid: false, reason: 'Wrong link: Private IP addresses (192.168.x.x) are prohibited.' };
      // 169.254.0.0/16 Link-local / Cloud Metadata (169.254.169.254)
      if (p1 === 169 && p2 === 254) return { isValid: false, reason: 'Wrong link: Cloud metadata and link-local addresses are prohibited.' };
      return { isValid: true, hostname: host };
    }

    // Check IPv6 loopback and private
    if (host === '::1' || host.startsWith('fe80:') || host.startsWith('fc00:') || host.startsWith('fd00:')) {
      return { isValid: false, reason: 'Wrong link: Private or loopback IPv6 addresses are prohibited.' };
    }

    // Ensure it has a valid domain extension (must include at least one dot)
    if (!host.includes('.')) {
      return { isValid: false, reason: 'Wrong link: Please specify a complete website domain name with an extension (e.g. example.com or https://example.com).' };
    }

    // Validate domain format (letters, numbers, hyphens, dots)
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
    if (!domainRegex.test(host)) {
      return { isValid: false, reason: 'Wrong link: Invalid website domain format. Please enter a valid website address (e.g. example.com).' };
    }

    // Validate TLD (extension must be at least 2 characters and not purely numeric)
    const tld = host.split('.').pop() || '';
    if (tld.length < 2 || /^\d+$/.test(tld)) {
      return { isValid: false, reason: `Wrong link: "${tld}" is not a valid top-level domain extension. Please check the website link.` };
    }

    return { isValid: true, hostname: host };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid URL';
    return { isValid: false, reason: `Wrong link: ${message}` };
  }
}

// In-memory rate limiting for IP scans (Max 5 free scans per 15 minutes per IP)
const ipScanLog = new Map<string, number[]>();

export function checkRateLimit(clientIp: string, maxRequests = 10, windowMs = 15 * 60 * 1000): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = ipScanLog.get(clientIp) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  validTimestamps.push(now);
  ipScanLog.set(clientIp, validTimestamps);
  return { allowed: true };
}
