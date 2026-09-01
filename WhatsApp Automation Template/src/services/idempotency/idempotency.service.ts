export class IdempotencyService {
  private processedKeys = new Map<string, number>(); // key -> timestamp
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Checks if an idempotency key (e.g. Meta webhook message_id) has already been processed
   */
  isDuplicate(key: string): boolean {
    this.cleanupExpired();
    if (!key) return false;

    if (this.processedKeys.has(key)) {
      console.warn(`🛡️ [Idempotency Guard]: Duplicate request detected for key "${key}". Suppressing duplicate side effects.`);
      return true;
    }

    this.processedKeys.set(key, Date.now());
    return false;
  }

  /**
   * Clears old entries from memory
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.processedKeys.entries()) {
      if (now - timestamp > this.TTL_MS) {
        this.processedKeys.delete(key);
      }
    }
  }
}

export const idempotencyService = new IdempotencyService();
