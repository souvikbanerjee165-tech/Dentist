export interface DecisionLogEntry {
  id: string;
  conversationId: string;
  userMessage: string;
  ragChunksUsed: string[];
  llmProvider: string;
  confidence: number;
  intent: string;
  validationErrors?: string[];
  executedAction: string;
  timestamp: string;
  durationMs: number;
}

export class DecisionLogger {
  private inMemoryLogs: DecisionLogEntry[] = [];
  private readonly MAX_LOGS = 100;

  /**
   * Records a complete diagnostic trace of an LLM turn and backend execution
   */
  logDecision(entry: Omit<DecisionLogEntry, 'id' | 'timestamp'>): DecisionLogEntry {
    const fullEntry: DecisionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > this.MAX_LOGS) {
      this.inMemoryLogs.pop();
    }

    console.log(`📝 [Decision Logged]: ${fullEntry.intent} (${Math.round(fullEntry.confidence * 100)}% conf.) -> ${fullEntry.executedAction}`);
    return fullEntry;
  }

  /**
   * Retrieves recent audit logs for the Doctor Diagnostics & Analytics panel
   */
  getRecentLogs(limit: number = 20): DecisionLogEntry[] {
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const decisionLogger = new DecisionLogger();
