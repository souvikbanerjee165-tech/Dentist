/**
 * SafeLogger: Sanitizes logs to prevent ePHI/PII leaks to stdout.
 * Masks phone numbers, names, emails, and sensitive clinical text.
 */
export class SafeLogger {
  public static maskPhone(phone?: string): string {
    if (!phone) return 'N/A';
    const clean = phone.trim();
    if (clean.length <= 4) return '***';
    return clean.slice(0, 2) + '****' + clean.slice(-4);
  }

  public static maskName(name?: string): string {
    if (!name) return 'Anonymous Patient';
    const parts = name.trim().split(/\s+/);
    return parts
      .map((p) => (p.length > 1 ? `${p[0]}***` : p))
      .join(' ');
  }

  public static maskPatientName(name?: string): string {
    return this.maskName(name);
  }

  public static maskEmail(email?: string): string {
    if (!email || !email.includes('@')) return '***@***.com';
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? `${user.slice(0, 2)}***` : `${user}***`;
    return `${maskedUser}@${domain}`;
  }

  public static redactClinicalText(text?: string): string {
    if (!text) return '';
    if (process.env.NODE_ENV === 'production') {
      return `[Clinical Content Redacted - Length: ${text.length} chars]`;
    }
    return text.slice(0, 40) + (text.length > 40 ? '...' : '');
  }

  public static info(tag: string, message?: any, meta?: any): void {
    const msg = typeof message === 'object' ? JSON.stringify(message) : (message || '');
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.log(`ℹ️ [${tag}] ${msg}${metaStr}`);
  }

  public static warn(tag: string, message?: any, meta?: any): void {
    const msg = typeof message === 'object' ? JSON.stringify(message) : (message || '');
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.warn(`⚠️ [${tag}] ${msg}${metaStr}`);
  }

  public static error(tag: string, message?: any, err?: any): void {
    const msg = typeof message === 'object' ? JSON.stringify(message) : (message || '');
    const errMsg = err?.message || err || '';
    console.error(`❌ [${tag}] ${msg} ${errMsg}`);
  }
}
