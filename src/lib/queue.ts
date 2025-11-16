// ===================================
// VIRALCUT AI - Queue System (In-Memory)
// ===================================

import type { QueueJob } from '@/types/video';

// ============ QUEUE NAMES ============
const QUEUES = {
  UPLOAD: 'queue:upload',
  PROCESS: 'queue:process',
  RENDER: 'queue:render',
  COMPLETED: 'queue:completed',
  FAILED: 'queue:failed',
} as const;

// ============ IN-MEMORY STORAGE ============
const inMemoryQueues: Record<string, QueueJob[]> = {
  [QUEUES.UPLOAD]: [],
  [QUEUES.PROCESS]: [],
  [QUEUES.RENDER]: [],
  [QUEUES.COMPLETED]: [],
  [QUEUES.FAILED]: [],
};

const jobStatuses: Record<string, {
  progress: number;
  currentStep?: string;
  timeRemaining?: number;
  totalTime?: number;
  error?: string;
}> = {};

// ============ QUEUE OPERATIONS ============

/**
 * Adicionar job à fila
 */
export async function enqueue(
  queueName: keyof typeof QUEUES,
  job: Omit<QueueJob, 'createdAt'>
): Promise<void> {
  const fullJob: QueueJob = {
    ...job,
    createdAt: Date.now(),
  };

  const queue = QUEUES[queueName];
  inMemoryQueues[queue].push(fullJob);
  console.log(`✅ Job ${job.id} added to ${queueName} queue (in-memory)`);
}

/**
 * Remover e retornar próximo job da fila
 */
export async function dequeue(queueName: keyof typeof QUEUES): Promise<QueueJob | null> {
  const queue = QUEUES[queueName];
  const job = inMemoryQueues[queue].shift();
  if (job) {
    console.log(`📤 Job ${job.id} dequeued from ${queueName} (in-memory)`);
  }
  return job || null;
}

/**
 * Obter tamanho da fila
 */
export async function getQueueSize(queueName: keyof typeof QUEUES): Promise<number> {
  const queue = QUEUES[queueName];
  return inMemoryQueues[queue].length;
}

/**
 * Limpar fila
 */
export async function clearQueue(queueName: keyof typeof QUEUES): Promise<void> {
  const queue = QUEUES[queueName];
  inMemoryQueues[queue] = [];
  console.log(`🗑️ Queue ${queueName} cleared (in-memory)`);
}

/**
 * Obter todos os jobs de uma fila (sem remover)
 */
export async function peekQueue(queueName: keyof typeof QUEUES): Promise<QueueJob[]> {
  const queue = QUEUES[queueName];
  return [...inMemoryQueues[queue]];
}

// ============ JOB STATUS TRACKING ============

/**
 * Salvar status de um job
 */
export async function setJobStatus(
  jobId: string,
  status: {
    progress: number;
    currentStep?: string;
    timeRemaining?: number;
    totalTime?: number;
    error?: string;
  }
): Promise<void> {
  jobStatuses[jobId] = status;
  console.log(`Job ${jobId} status:`, status);
}

/**
 * Obter status de um job
 */
export async function getJobStatus(jobId: string): Promise<{
  progress: number;
  currentStep?: string;
  timeRemaining?: number;
  totalTime?: number;
  error?: string;
} | null> {
  return jobStatuses[jobId] || null;
}

// ============ PRIORITY QUEUE ============

/**
 * Adicionar job com prioridade (maior número = maior prioridade)
 */
export async function enqueuePriority(
  queueName: keyof typeof QUEUES,
  job: Omit<QueueJob, 'createdAt'>
): Promise<void> {
  const fullJob: QueueJob = {
    ...job,
    createdAt: Date.now(),
  };

  const queue = QUEUES[queueName];
  const jobs = inMemoryQueues[queue];
  const insertIndex = jobs.findIndex((j) => j.priority < job.priority);
  if (insertIndex === -1) {
    jobs.push(fullJob);
  } else {
    jobs.splice(insertIndex, 0, fullJob);
  }
  console.log(`✅ Priority job ${job.id} added to ${queueName} (in-memory, priority: ${job.priority})`);
}

/**
 * Remover job de maior prioridade
 */
export async function dequeuePriority(queueName: keyof typeof QUEUES): Promise<QueueJob | null> {
  return dequeue(queueName);
}

// ============ WORKER HELPERS ============

/**
 * Processar jobs de uma fila continuamente
 */
export async function processQueue(
  queueName: keyof typeof QUEUES,
  processor: (job: QueueJob) => Promise<void>,
  options: {
    pollInterval?: number;
    maxRetries?: number;
  } = {}
): Promise<void> {
  const { pollInterval = 1000, maxRetries = 3 } = options;

  console.log(`🔄 Starting queue processor for ${queueName}`);

  while (true) {
    try {
      const job = await dequeue(queueName);

      if (job) {
        console.log(`⚙️ Processing job ${job.id}`);

        try {
          await processor(job);
          await enqueue('COMPLETED', job);
          console.log(`✅ Job ${job.id} completed`);
        } catch (error) {
          console.error(`❌ Job ${job.id} failed:`, error);

          const retryCount = (job.data.retryCount || 0) + 1;
          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying job ${job.id} (attempt ${retryCount}/${maxRetries})`);
            await enqueue(queueName, {
              ...job,
              data: { ...job.data, retryCount },
            });
          } else {
            console.log(`💀 Job ${job.id} failed after ${maxRetries} attempts`);
            await enqueue('FAILED', {
              ...job,
              data: { ...job.data, error: error instanceof Error ? error.message : 'Unknown error' },
            });
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    } catch (error) {
      console.error('Queue processor error:', error);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}

// ============ METRICS ============

/**
 * Obter estatísticas das filas
 */
export async function getQueueStats() {
  const stats = {
    upload: await getQueueSize('UPLOAD'),
    process: await getQueueSize('PROCESS'),
    render: await getQueueSize('RENDER'),
    completed: await getQueueSize('COMPLETED'),
    failed: await getQueueSize('FAILED'),
  };

  return stats;
}

export default {
  enqueue,
  dequeue,
  enqueuePriority,
  dequeuePriority,
  getQueueSize,
  clearQueue,
  peekQueue,
  setJobStatus,
  getJobStatus,
  processQueue,
  getQueueStats,
};
