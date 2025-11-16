// ===================================
// VIRALCUT AI - Supabase Client
// ===================================

import { createClient } from '@supabase/supabase-js';

// Validar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente público (para uso no frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (para uso no backend com permissões elevadas)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

// ============ HELPER FUNCTIONS ============

/**
 * Upload de arquivo para o Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}

/**
 * Obter URL pública de um arquivo
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Obter URL assinada (temporária) de um arquivo
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Deletar arquivo do storage
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Listar arquivos em um bucket
 */
export async function listFiles(bucket: string, path?: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(path || '', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data;
}

// ============ DATABASE HELPERS ============

/**
 * Criar um novo vídeo no banco
 */
export async function createVideo(data: {
  user_id: string;
  title?: string;
  original_url: string;
  style_config?: any;
  duration?: number;
  format?: string;
  aspect_ratio?: string;
  file_size?: number;
}) {
  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create video: ${error.message}`);
  }

  return video;
}

/**
 * Atualizar status de um vídeo
 */
export async function updateVideoStatus(
  videoId: string,
  status: string,
  additionalData?: any
) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalData,
  };

  const { data, error } = await supabaseAdmin
    .from('videos')
    .update(updateData)
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update video status: ${error.message}`);
  }

  return data;
}

/**
 * Obter vídeo por ID
 */
export async function getVideo(videoId: string) {
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single();

  if (error) {
    throw new Error(`Failed to get video: ${error.message}`);
  }

  return data;
}

/**
 * Criar job de processamento
 */
export async function createProcessingJob(data: {
  video_id: string;
  status?: string;
  metadata?: any;
}) {
  const { data: job, error } = await supabaseAdmin
    .from('processing_jobs')
    .insert({
      ...data,
      status: data.status || 'pending',
      progress: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create processing job: ${error.message}`);
  }

  return job;
}

/**
 * Atualizar progresso do job
 */
export async function updateJobProgress(
  jobId: string,
  progress: number,
  currentStep?: string,
  status?: string
) {
  const updateData: any = {
    progress,
    current_step: currentStep,
  };

  if (status) {
    updateData.status = status;
  }

  if (status === 'running' && !updateData.started_at) {
    updateData.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('processing_jobs')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job progress: ${error.message}`);
  }

  return data;
}

/**
 * Salvar análise de IA
 */
export async function saveAIAnalysis(videoId: string, analysis: any) {
  const { data, error } = await supabaseAdmin
    .from('video_analytics')
    .insert({
      video_id: videoId,
      ...analysis,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save AI analysis: ${error.message}`);
  }

  // Atualizar também o campo ai_analysis no vídeo
  await supabaseAdmin
    .from('videos')
    .update({ ai_analysis: analysis })
    .eq('id', videoId);

  return data;
}

/**
 * Salvar legendas
 */
export async function saveCaptions(videoId: string, captions: any[]) {
  const captionsWithVideoId = captions.map((caption) => ({
    video_id: videoId,
    ...caption,
  }));

  const { data, error } = await supabaseAdmin
    .from('captions')
    .insert(captionsWithVideoId)
    .select();

  if (error) {
    throw new Error(`Failed to save captions: ${error.message}`);
  }

  return data;
}

/**
 * Obter legendas de um vídeo
 */
export async function getCaptions(videoId: string) {
  const { data, error } = await supabaseAdmin
    .from('captions')
    .select('*')
    .eq('video_id', videoId)
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to get captions: ${error.message}`);
  }

  return data;
}

/**
 * Salvar efeitos visuais
 */
export async function saveVisualEffects(videoId: string, effects: any[]) {
  const effectsWithVideoId = effects.map((effect) => ({
    video_id: videoId,
    ...effect,
  }));

  const { data, error } = await supabaseAdmin
    .from('visual_effects')
    .insert(effectsWithVideoId)
    .select();

  if (error) {
    throw new Error(`Failed to save visual effects: ${error.message}`);
  }

  return data;
}

export default supabase;
