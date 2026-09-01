export interface DLQJob<T = any> {
  id: string;
  actionType: string;
  payload: T;
  attempts: number;
  maxRetries: number;
  lastError: string;
  createdAt: string;
  nextRetryAt: number;
  status: 'pending' | 'retrying' | 'succeeded' | 'dead';
}

export class DeadLetterQueue {
  private queue: DLQJob[] = [];

  /**
   * Enqueues a failed side-effect job for automated retry
   */
  enqueue<T>(actionType: string, payload: T, error: string, maxRetries: number = 3): DLQJob<T> {
    const job: DLQJob<T> = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actionType,
      payload,
      attempts: 1,
      maxRetries,
      lastError: error,
      createdAt: new Date().toISOString(),
      nextRetryAt: Date.now() + 60000, // 1 minute exponential backoff
      status: 'pending',
    };

    this.queue.push(job);
    console.error(`🚨 [DLQ Enqueued]: Job ${job.id} (${actionType}) failed with: "${error}". Scheduled for retry.`);
    return job;
  }

  /**
   * Returns all active DLQ jobs
   */
  getJobs(): DLQJob[] {
    return [...this.queue];
  }

  /**
   * Marks a job as resolved/succeeded
   */
  resolveJob(jobId: string): void {
    const job = this.queue.find((j) => j.id === jobId);
    if (job) {
      job.status = 'succeeded';
      console.log(`✅ [DLQ Succeeded]: Job ${jobId} successfully recovered.`);
    }
  }
}

export const deadLetterQueue = new DeadLetterQueue();
