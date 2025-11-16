// ===================================
// VIRALCUT AI - TypeScript Types
// ===================================

// ============ VIDEO TYPES ============

export type VideoStatus = 'uploading' | 'queued' | 'processing' | 'completed' | 'error';

export type VideoStyle = 'modern' | 'minimal' | 'energetic';

export type VideoPace = 'fast' | 'medium' | 'intense';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export interface StyleConfig {
  style: VideoStyle;
  pace: VideoPace;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Video {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  original_url: string;
  processed_url?: string;
  thumbnail_url?: string;
  status: VideoStatus;
  style_config: StyleConfig;
  ai_analysis?: AIAnalysis;
  duration?: number;
  format?: string;
  aspect_ratio?: AspectRatio;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

// ============ PROCESSING TYPES ============

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ProcessingJob {
  id: string;
  video_id: string;
  status: JobStatus;
  progress: number; // 0-100
  current_step?: string;
  error_message?: string;
  retry_count: number;
  metadata: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

// ============ CAPTION TYPES ============

export interface Caption {
  id: string;
  video_id: string;
  text: string;
  start_time: number;
  end_time: number;
  style: CaptionStyle;
  is_highlighted: boolean;
  highlight_words?: string[];
  confidence?: number;
  created_at: string;
}

export interface CaptionStyle {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  opacity: number;
  position: 'top' | 'center' | 'bottom';
  animation?: 'fade' | 'slide-up' | 'bounce' | 'glow';
}

// ============ AI ANALYSIS TYPES ============

export interface AIAnalysis {
  virality_score: number; // 0-1
  emotion_peaks: EmotionPeak[];
  keywords: Keyword[];
  topics: string[];
  suggested_title: string;
  suggested_description: string;
  suggested_hashtags: string[];
  suggested_ctas: string[];
  scene_changes: SceneChange[];
  silence_periods: SilencePeriod[];
  volume_peaks: VolumePeak[];
}

export interface EmotionPeak {
  timestamp: number;
  emotion: 'joy' | 'surprise' | 'anger' | 'sadness' | 'fear' | 'neutral';
  intensity: number; // 0-1
}

export interface Keyword {
  word: string;
  frequency: number;
  relevance: number; // 0-1
  timestamps: number[];
}

export interface SceneChange {
  timestamp: number;
  type: 'cut' | 'fade' | 'dissolve';
  confidence: number;
}

export interface SilencePeriod {
  start: number;
  end: number;
  duration: number;
}

export interface VolumePeak {
  timestamp: number;
  volume: number; // dB
}

// ============ VISUAL EFFECTS TYPES ============

export type EffectType = 'zoom' | 'transition' | 'color_grade' | 'blur' | 'shake' | 'glow';

export interface VisualEffect {
  id: string;
  video_id: string;
  effect_type: EffectType;
  start_time: number;
  end_time: number;
  parameters: Record<string, any>;
  priority: number;
  created_at: string;
}

export interface ZoomEffect {
  scale: number; // 1.0 = normal, 1.5 = 150%
  centerX: number; // 0-1 (percentage)
  centerY: number; // 0-1 (percentage)
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface ColorGradeEffect {
  brightness: number; // -1 to 1
  contrast: number; // -1 to 1
  saturation: number; // -1 to 1
  temperature: number; // -1 to 1 (cool to warm)
}

// ============ TRANSCRIPTION TYPES ============

export interface Transcription {
  text: string;
  words: TranscriptionWord[];
  language: string;
  duration: number;
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

// ============ UPLOAD TYPES ============

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StatusResponse {
  status: VideoStatus;
  progress: number;
  currentStep?: string;
  video?: Video;
  error?: string;
}

export interface DownloadResponse {
  downloadUrl: string;
  expiresAt: string;
}

// ============ FFMPEG TYPES ============

export interface FFmpegCommand {
  input: string;
  output: string;
  filters: string[];
  options: string[];
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  aspectRatio: AspectRatio;
}

// ============ QUEUE TYPES ============

export interface QueueJob {
  id: string;
  type: 'upload' | 'process' | 'render';
  videoId: string;
  priority: number;
  data: Record<string, any>;
  createdAt: number;
}

// ============ USER PREFERENCES TYPES ============

export interface UserPreferences {
  id: string;
  user_id: string;
  default_style: VideoStyle;
  default_pace: VideoPace;
  default_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  auto_process: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============ ANALYTICS TYPES ============

export interface VideoAnalytics {
  id: string;
  video_id: string;
  virality_score: number;
  emotion_peaks: EmotionPeak[];
  keywords: Keyword[];
  topics: string[];
  suggested_title: string;
  suggested_description: string;
  suggested_hashtags: string[];
  suggested_ctas: string[];
  scene_changes: SceneChange[];
  silence_periods: SilencePeriod[];
  volume_peaks: VolumePeak[];
  created_at: string;
}

// ============ ERROR TYPES ============

export class VideoProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public videoId?: string,
    public step?: string
  ) {
    super(message);
    this.name = 'VideoProcessingError';
  }
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

// ============ UTILITY TYPES ============

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
