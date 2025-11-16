// ===================================
// VIRALCUT AI - FFmpeg Commands
// ===================================

import type { Caption, VisualEffect, StyleConfig } from '@/types/video';

// ============ BASIC OPERATIONS ============

/**
 * Extrair áudio de um vídeo
 */
export function extractAudio(inputPath: string, outputPath: string): string {
  return `ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 44100 -ac 2 "${outputPath}"`;
}

/**
 * Obter metadados do vídeo
 */
export function getVideoMetadata(inputPath: string): string {
  return `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`;
}

/**
 * Obter duração do vídeo
 */
export function getVideoDuration(inputPath: string): string {
  return `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
}

// ============ CAPTION GENERATION ============

/**
 * Gerar filtro de legenda para FFmpeg
 */
export function generateCaptionFilter(
  caption: Caption,
  videoWidth: number = 1080,
  videoHeight: number = 1920,
  style: StyleConfig
): string {
  const {
    text,
    start_time,
    end_time,
    is_highlighted,
    style: captionStyle,
  } = caption;

  // Escapar texto para FFmpeg
  const escapedText = text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');

  // Configurações de estilo
  const fontSize = captionStyle?.fontSize || 60;
  const fontColor = is_highlighted ? style.colors.accent : (captionStyle?.fontColor || '#FFFFFF');
  const bgColor = captionStyle?.backgroundColor || '#000000';
  const opacity = captionStyle?.opacity || 0.8;

  // Posição (bottom por padrão)
  const yPosition = videoHeight - 200;

  // Converter opacidade para hex
  const bgOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
  const bgColorWithAlpha = `${bgColor}${bgOpacity}`;

  return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${escapedText}':fontcolor=${fontColor}:fontsize=${fontSize}:box=1:boxcolor=${bgColorWithAlpha}:boxborderw=10:x=(w-text_w)/2:y=${yPosition}:enable='between(t,${start_time},${end_time})'`;
}

/**
 * Aplicar todas as legendas ao vídeo
 */
export function applyCaptions(
  inputPath: string,
  outputPath: string,
  captions: Caption[],
  style: StyleConfig,
  videoWidth: number = 1080,
  videoHeight: number = 1920
): string {
  // Gerar filtros para cada legenda
  const captionFilters = captions.map((caption) =>
    generateCaptionFilter(caption, videoWidth, videoHeight, style)
  );

  // Combinar todos os filtros
  const filterComplex = captionFilters.join(',');

  return `ffmpeg -i "${inputPath}" -vf "${filterComplex}" -c:a copy "${outputPath}"`;
}

// ============ VISUAL EFFECTS ============

/**
 * Aplicar zoom effect
 */
export function applyZoomEffect(
  startTime: number,
  endTime: number,
  scale: number = 1.2,
  centerX: number = 0.5,
  centerY: number = 0.5
): string {
  const duration = endTime - startTime;
  return `zoompan=z='if(between(t,${startTime},${endTime}),${scale},1)':d=${duration}:x='iw*${centerX}':y='ih*${centerY}':s=1080x1920`;
}

/**
 * Aplicar correção de cor
 */
export function applyColorGrade(
  brightness: number = 0.06,
  contrast: number = 1.1,
  saturation: number = 1.2
): string {
  return `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;
}

/**
 * Aplicar transição entre cortes
 */
export function applyTransition(
  startTime: number,
  duration: number = 0.5,
  type: 'fade' | 'dissolve' = 'fade'
): string {
  if (type === 'fade') {
    return `fade=t=in:st=${startTime}:d=${duration}`;
  }
  return `fade=t=in:st=${startTime}:d=${duration}:alpha=1`;
}

/**
 * Aplicar blur effect
 */
export function applyBlur(strength: number = 5): string {
  return `boxblur=${strength}:1`;
}

/**
 * Aplicar shake effect (simulação de câmera tremida)
 */
export function applyShake(
  startTime: number,
  endTime: number,
  intensity: number = 10
): string {
  return `crop=in_w-${intensity}:in_h-${intensity}:${intensity}*sin(2*PI*t):${intensity}*cos(2*PI*t):enable='between(t,${startTime},${endTime})'`;
}

// ============ AUDIO PROCESSING ============

/**
 * Reduzir ruído de áudio
 */
export function reduceNoise(inputPath: string, outputPath: string): string {
  return `ffmpeg -i "${inputPath}" -af "highpass=f=200,lowpass=f=3000,afftdn=nf=-25" "${outputPath}"`;
}

/**
 * Normalizar volume do áudio
 */
export function normalizeAudio(inputPath: string, outputPath: string): string {
  return `ffmpeg -i "${inputPath}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" "${outputPath}"`;
}

/**
 * Adicionar música de fundo
 */
export function addBackgroundMusic(
  videoPath: string,
  musicPath: string,
  outputPath: string,
  musicVolume: number = 0.3
): string {
  return `ffmpeg -i "${videoPath}" -i "${musicPath}" -filter_complex "[1:a]volume=${musicVolume}[music];[0:a][music]amix=inputs=2:duration=first" -c:v copy "${outputPath}"`;
}

// ============ SCENE CUTTING ============

/**
 * Cortar vídeo em um intervalo específico
 */
export function cutVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number
): string {
  const duration = endTime - startTime;
  return `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;
}

/**
 * Remover silêncios do vídeo
 */
export function removeSilences(
  inputPath: string,
  outputPath: string,
  silenceThreshold: number = -30,
  silenceDuration: number = 0.5
): string {
  return `ffmpeg -i "${inputPath}" -af "silenceremove=start_periods=1:start_duration=${silenceDuration}:start_threshold=${silenceThreshold}dB:detection=peak,aformat=dblp,areverse,silenceremove=start_periods=1:start_duration=${silenceDuration}:start_threshold=${silenceThreshold}dB:detection=peak,aformat=dblp,areverse" -c:v copy "${outputPath}"`;
}

// ============ THUMBNAIL GENERATION ============

/**
 * Gerar thumbnail de um frame específico
 */
export function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: number,
  width: number = 1280,
  height: number = 720
): string {
  return `ffmpeg -i "${inputPath}" -ss ${timestamp} -vframes 1 -vf "scale=${width}:${height}" "${outputPath}"`;
}

/**
 * Gerar thumbnail viral (com texto e efeitos)
 */
export function generateViralThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: number,
  title: string,
  width: number = 1280,
  height: number = 720
): string {
  const escapedTitle = title
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:');

  return `ffmpeg -i "${inputPath}" -ss ${timestamp} -vframes 1 -vf "scale=${width}:${height},eq=brightness=0.1:contrast=1.2:saturation=1.3,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${escapedTitle}':fontcolor=white:fontsize=80:box=1:boxcolor=black@0.7:boxborderw=20:x=(w-text_w)/2:y=h-150" "${outputPath}"`;
}

// ============ COMPLETE PIPELINE ============

/**
 * Pipeline completo de edição
 */
export function generateCompleteEditingPipeline(
  inputPath: string,
  outputPath: string,
  captions: Caption[],
  effects: VisualEffect[],
  style: StyleConfig,
  options: {
    removeNoise?: boolean;
    normalizeAudio?: boolean;
    colorGrade?: boolean;
    videoWidth?: number;
    videoHeight?: number;
  } = {}
): string[] {
  const {
    removeNoise = true,
    normalizeAudio = true,
    colorGrade = true,
    videoWidth = 1080,
    videoHeight = 1920,
  } = options;

  const commands: string[] = [];
  let currentInput = inputPath;
  let stepOutput = '';

  // Step 1: Extrair áudio para processamento
  if (removeNoise || normalizeAudio) {
    const audioPath = inputPath.replace(/\.[^.]+$/, '_audio.wav');
    commands.push(extractAudio(currentInput, audioPath));

    // Step 2: Processar áudio
    if (removeNoise) {
      const denoisedPath = inputPath.replace(/\.[^.]+$/, '_denoised.wav');
      commands.push(reduceNoise(audioPath, denoisedPath));
      stepOutput = denoisedPath;
    }

    if (normalizeAudio) {
      const normalizedPath = inputPath.replace(/\.[^.]+$/, '_normalized.wav');
      commands.push(normalizeAudio(stepOutput || audioPath, normalizedPath));
      stepOutput = normalizedPath;
    }
  }

  // Step 3: Construir filter complex para vídeo
  const filters: string[] = [];

  // Adicionar correção de cor
  if (colorGrade) {
    filters.push(applyColorGrade(0.06, 1.1, 1.2));
  }

  // Adicionar efeitos visuais
  for (const effect of effects) {
    if (effect.effect_type === 'zoom') {
      const params = effect.parameters as any;
      filters.push(
        applyZoomEffect(
          effect.start_time,
          effect.end_time,
          params.scale || 1.2,
          params.centerX || 0.5,
          params.centerY || 0.5
        )
      );
    } else if (effect.effect_type === 'transition') {
      filters.push(applyTransition(effect.start_time, 0.5));
    }
  }

  // Adicionar legendas
  for (const caption of captions) {
    filters.push(generateCaptionFilter(caption, videoWidth, videoHeight, style));
  }

  // Step 4: Aplicar todos os filtros
  const filterComplex = filters.join(',');
  const videoWithEffects = inputPath.replace(/\.[^.]+$/, '_effects.mp4');

  if (stepOutput) {
    // Combinar vídeo processado com áudio processado
    commands.push(
      `ffmpeg -i "${currentInput}" -i "${stepOutput}" -filter_complex "${filterComplex}" -map 0:v -map 1:a -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k "${videoWithEffects}"`
    );
  } else {
    // Apenas processar vídeo
    commands.push(
      `ffmpeg -i "${currentInput}" -vf "${filterComplex}" -c:v libx264 -preset medium -crf 23 -c:a copy "${videoWithEffects}"`
    );
  }

  // Step 5: Mover para output final
  commands.push(`mv "${videoWithEffects}" "${outputPath}"`);

  return commands;
}

// ============ ASPECT RATIO CONVERSION ============

/**
 * Converter aspect ratio do vídeo
 */
export function convertAspectRatio(
  inputPath: string,
  outputPath: string,
  targetRatio: '9:16' | '16:9' | '1:1'
): string {
  const ratioMap = {
    '9:16': { width: 1080, height: 1920 },
    '16:9': { width: 1920, height: 1080 },
    '1:1': { width: 1080, height: 1080 },
  };

  const { width, height } = ratioMap[targetRatio];

  return `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black" -c:a copy "${outputPath}"`;
}

// ============ OPTIMIZATION ============

/**
 * Otimizar vídeo para web
 */
export function optimizeForWeb(inputPath: string, outputPath: string): string {
  return `ffmpeg -i "${inputPath}" -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`;
}

/**
 * Comprimir vídeo
 */
export function compressVideo(
  inputPath: string,
  outputPath: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  const crfMap = {
    low: 28,
    medium: 23,
    high: 18,
  };

  const crf = crfMap[quality];

  return `ffmpeg -i "${inputPath}" -c:v libx264 -preset medium -crf ${crf} -c:a aac -b:a 128k "${outputPath}"`;
}

export default {
  extractAudio,
  getVideoMetadata,
  getVideoDuration,
  generateCaptionFilter,
  applyCaptions,
  applyZoomEffect,
  applyColorGrade,
  applyTransition,
  applyBlur,
  applyShake,
  reduceNoise,
  normalizeAudio,
  addBackgroundMusic,
  cutVideo,
  removeSilences,
  generateThumbnail,
  generateViralThumbnail,
  generateCompleteEditingPipeline,
  convertAspectRatio,
  optimizeForWeb,
  compressVideo,
};
