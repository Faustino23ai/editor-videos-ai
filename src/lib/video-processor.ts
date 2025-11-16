// ===================================
// VIRALCUT AI - Video Processor Core (Mock Version)
// ===================================

import { enqueue, setJobStatus } from './queue';
import type { Video, StyleConfig, VisualEffect } from '@/types/video';

// ============ CONFIGURATION ============

const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500') * 1024 * 1024;
const MAX_DURATION = parseInt(process.env.MAX_VIDEO_DURATION_MINUTES || '30') * 60;

// Tempo estimado por etapa (em segundos)
const STEP_DURATIONS = {
  validation: 3,
  extraction: 8,
  analysis: 15,
  effects: 10,
  rendering: 50,
  thumbnail: 5,
  upload: 9,
};

// ============ IN-MEMORY STORAGE ============
const processingJobs: Record<string, {
  id: string;
  video_id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  metadata?: any;
}> = {};

const videos: Record<string, Video> = {};

// ============ HELPER FUNCTIONS ============

/**
 * Calcular tempo restante estimado
 */
function calculateTimeRemaining(
  currentStep: string,
  stepProgress: number,
  videoDuration: number
): number {
  const stepMap: Record<string, keyof typeof STEP_DURATIONS> = {
    'Validating video': 'validation',
    'Extracting audio': 'extraction',
    'Analyzing with AI': 'analysis',
    'Generating visual effects': 'effects',
    'Rendering video': 'rendering',
    'Generating thumbnail': 'thumbnail',
    'Uploading': 'upload',
  };

  const currentStepKey = stepMap[currentStep] || 'rendering';
  const steps = Object.keys(STEP_DURATIONS) as (keyof typeof STEP_DURATIONS)[];
  const currentStepIndex = steps.indexOf(currentStepKey);

  const currentStepDuration = STEP_DURATIONS[currentStepKey];
  const currentStepRemaining = currentStepDuration * (1 - stepProgress / 100);

  let futureStepsTime = 0;
  for (let i = currentStepIndex + 1; i < steps.length; i++) {
    futureStepsTime += STEP_DURATIONS[steps[i]];
  }

  const durationMultiplier = Math.min(videoDuration / 60, 3);
  const totalRemaining = (currentStepRemaining + futureStepsTime) * durationMultiplier;

  return Math.max(5, Math.round(totalRemaining));
}

/**
 * Criar job de processamento (mock)
 */
async function createProcessingJob(data: {
  video_id: string;
  status: 'running' | 'completed' | 'failed';
  metadata?: any;
}): Promise<{ id: string }> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  processingJobs[jobId] = {
    id: jobId,
    video_id: data.video_id,
    status: data.status,
    progress: 0,
    currentStep: 'Validating video',
    metadata: data.metadata,
  };
  return { id: jobId };
}

/**
 * Atualizar progresso do job (mock)
 */
async function updateJobProgress(
  jobId: string,
  progress: number,
  currentStep: string,
  status: 'running' | 'completed' | 'failed'
): Promise<void> {
  if (processingJobs[jobId]) {
    processingJobs[jobId].progress = progress;
    processingJobs[jobId].currentStep = currentStep;
    processingJobs[jobId].status = status;
  }
}

/**
 * Atualizar status do vídeo (mock)
 */
async function updateVideoStatus(
  videoId: string,
  status: 'queued' | 'processing' | 'completed' | 'error',
  updates?: Partial<Video>
): Promise<void> {
  if (videos[videoId]) {
    videos[videoId] = {
      ...videos[videoId],
      status,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Salvar análise de IA (mock)
 */
async function saveAIAnalysis(videoId: string, analysis: any): Promise<void> {
  if (videos[videoId]) {
    videos[videoId].ai_analysis = analysis;
  }
}

/**
 * Salvar legendas (mock)
 */
async function saveCaptions(videoId: string, captions: any[]): Promise<void> {
  console.log(`Captions saved for video ${videoId}:`, captions.length);
}

/**
 * Salvar efeitos visuais (mock)
 */
async function saveVisualEffects(videoId: string, effects: VisualEffect[]): Promise<void> {
  console.log(`Visual effects saved for video ${videoId}:`, effects.length);
}

/**
 * Mock de análise de IA
 */
function mockAnalysis() {
  return {
    virality_score: 0.85,
    suggested_title: '🔥 Vídeo Incrível que Vai Viralizar!',
    suggested_description: 'Este vídeo foi otimizado pela IA para máximo engajamento. Compartilhe agora!',
    suggested_hashtags: ['#viral', '#trending', '#ai', '#videoediting'],
    emotion_peaks: [
      { timestamp: 5, emotion: 'excitement', intensity: 0.9 },
      { timestamp: 15, emotion: 'surprise', intensity: 0.85 },
    ],
    scene_changes: [
      { timestamp: 10, type: 'cut' },
      { timestamp: 20, type: 'transition' },
    ],
    audio_quality: 0.9,
    visual_quality: 0.95,
  };
}

/**
 * Mock de transcrição
 */
function mockTranscription() {
  return {
    text: 'Este é um vídeo de demonstração processado pela IA.',
    segments: [],
  };
}

// ============ MAIN PROCESSING PIPELINE ============

/**
 * Processar vídeo completo (mock - simula processamento)
 */
export async function processVideo(
  videoId: string,
  userId: string,
  videoPath: string,
  styleConfig: StyleConfig
): Promise<void> {
  console.log(`🚀 Starting mock video processing for ${videoId}`);

  const startTime = Date.now();
  const mockDuration = 120; // 2 minutos de vídeo simulado

  const job = await createProcessingJob({
    video_id: videoId,
    status: 'running',
    metadata: { styleConfig, startTime },
  });

  try {
    // Simular processamento com etapas
    const steps = [
      { progress: 5, step: 'Validating video', delay: 500 },
      { progress: 15, step: 'Extracting audio', delay: 1000 },
      { progress: 30, step: 'Analyzing with AI', delay: 1500 },
      { progress: 50, step: 'Generating visual effects', delay: 1000 },
      { progress: 70, step: 'Rendering video', delay: 2000 },
      { progress: 92, step: 'Generating thumbnail', delay: 500 },
      { progress: 95, step: 'Uploading', delay: 1000 },
      { progress: 98, step: 'Finalizing', delay: 500 },
    ];

    for (const { progress, step, delay } of steps) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const timeRemaining = calculateTimeRemaining(step, progress, mockDuration);
      
      await updateJobProgress(job.id, progress, step, 'running');
      await setJobStatus(job.id, {
        progress,
        currentStep: step,
        timeRemaining,
      });
    }

    // Gerar análise mock
    const analysis = mockAnalysis();
    await saveAIAnalysis(videoId, analysis);

    // Finalizar
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    await updateJobProgress(job.id, 100, 'Completed', 'completed');
    await setJobStatus(job.id, {
      progress: 100,
      currentStep: 'Completed',
      timeRemaining: 0,
      totalTime,
    });

    await updateVideoStatus(videoId, 'completed', {
      processed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
      duration: mockDuration,
      ai_analysis: analysis,
    });

    console.log(`✅ Mock video processing completed for ${videoId} in ${totalTime}s`);

    await enqueue('COMPLETED', {
      id: job.id,
      type: 'process',
      videoId,
      priority: 0,
      data: { status: 'completed', totalTime },
    });
  } catch (error) {
    console.error(`❌ Mock video processing failed for ${videoId}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await updateJobProgress(job.id, 0, 'Failed', 'failed');
    await setJobStatus(job.id, {
      progress: 0,
      currentStep: 'Failed',
      error: errorMessage,
      timeRemaining: 0,
    });

    await updateVideoStatus(videoId, 'error', {
      ai_analysis: { error: errorMessage },
    });

    await enqueue('FAILED', {
      id: job.id,
      type: 'process',
      videoId,
      priority: 0,
      data: { error: errorMessage },
    });

    throw error;
  }
}

/**
 * Processar vídeo de forma assíncrona (adicionar à fila)
 */
export async function queueVideoProcessing(
  videoId: string,
  userId: string,
  videoPath: string,
  styleConfig: StyleConfig
): Promise<void> {
  console.log(`📋 Queueing video ${videoId} for mock processing`);

  await enqueue('PROCESS', {
    id: videoId,
    type: 'process',
    videoId,
    priority: 1,
    data: {
      userId,
      videoPath,
      styleConfig,
    },
  });

  await updateVideoStatus(videoId, 'queued');
}

/**
 * Obter metadados do vídeo (mock)
 */
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  return {
    duration: 120,
    width: 1920,
    height: 1080,
    format: 'mp4',
    size: 50 * 1024 * 1024, // 50MB
  };
}

export default {
  processVideo,
  queueVideoProcessing,
  getVideoMetadata,
};
