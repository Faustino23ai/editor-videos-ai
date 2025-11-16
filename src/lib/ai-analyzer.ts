// ===================================
// VIRALCUT AI - AI Analyzer
// ===================================

import OpenAI from 'openai';
import type { Transcription, AIAnalysis, EmotionPeak, Keyword } from '@/types/video';

// Validar API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ OpenAI API key not configured');
}

// Cliente OpenAI
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// ============ TRANSCRIPTION ============

/**
 * Transcrever áudio usando Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<Transcription> {
  if (!openai) {
    throw new Error('OpenAI API not configured');
  }

  console.log('🎤 Starting audio transcription with Whisper...');

  try {
    // Criar arquivo temporário para o Whisper
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularity: ['word'],
    });

    console.log('✅ Transcription completed');

    return {
      text: response.text,
      words: (response as any).words || [],
      language: response.language || 'unknown',
      duration: (response as any).duration || 0,
    };
  } catch (error) {
    console.error('❌ Transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============ VIRALITY ANALYSIS ============

/**
 * Analisar viralidade do conteúdo usando GPT-4
 */
export async function analyzeVirality(transcription: Transcription): Promise<AIAnalysis> {
  if (!openai) {
    throw new Error('OpenAI API not configured');
  }

  console.log('🧠 Analyzing virality with GPT-4...');

  const systemPrompt = `You are an expert in viral social media content analysis.
Analyze the provided video transcription and return a JSON object with:

1. virality_score (0-1): Overall viral potential
2. emotion_peaks: Array of emotional high points with timestamps
3. keywords: Most impactful words with frequency and relevance
4. topics: Main topics discussed
5. suggested_title: Catchy, viral-optimized title
6. suggested_description: Engaging description
7. suggested_hashtags: 5-10 relevant hashtags
8. suggested_ctas: Effective calls-to-action

Focus on:
- Emotional impact moments
- Surprising or controversial statements
- Quotable phrases
- Humor or entertainment value
- Educational value
- Relatability

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this video transcription:\n\n${transcription.text}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from GPT-4');
    }

    const analysis = JSON.parse(content);

    console.log('✅ Virality analysis completed');
    console.log(`📊 Virality score: ${analysis.virality_score}`);

    // Adicionar campos que podem estar faltando
    return {
      virality_score: analysis.virality_score || 0.5,
      emotion_peaks: analysis.emotion_peaks || [],
      keywords: analysis.keywords || [],
      topics: analysis.topics || [],
      suggested_title: analysis.suggested_title || '',
      suggested_description: analysis.suggested_description || '',
      suggested_hashtags: analysis.suggested_hashtags || [],
      suggested_ctas: analysis.suggested_ctas || [],
      scene_changes: [],
      silence_periods: [],
      volume_peaks: [],
    };
  } catch (error) {
    console.error('❌ Virality analysis failed:', error);
    throw new Error(`Virality analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============ CAPTION GENERATION ============

/**
 * Gerar legendas estilizadas a partir da transcrição
 */
export function generateCaptions(
  transcription: Transcription,
  viralKeywords: string[]
): Array<{
  text: string;
  start_time: number;
  end_time: number;
  is_highlighted: boolean;
  highlight_words: string[];
}> {
  console.log('📝 Generating captions...');

  const captions: Array<{
    text: string;
    start_time: number;
    end_time: number;
    is_highlighted: boolean;
    highlight_words: string[];
  }> = [];

  // Agrupar palavras em frases (máximo 5 palavras por legenda)
  const wordsPerCaption = 5;
  const words = transcription.words;

  for (let i = 0; i < words.length; i += wordsPerCaption) {
    const captionWords = words.slice(i, i + wordsPerCaption);
    if (captionWords.length === 0) continue;

    const text = captionWords.map((w) => w.word).join(' ');
    const startTime = captionWords[0].start;
    const endTime = captionWords[captionWords.length - 1].end;

    // Verificar se contém palavras virais
    const highlightWords = captionWords
      .filter((w) => viralKeywords.includes(w.word.toLowerCase()))
      .map((w) => w.word);

    captions.push({
      text,
      start_time: startTime,
      end_time: endTime,
      is_highlighted: highlightWords.length > 0,
      highlight_words: highlightWords,
    });
  }

  console.log(`✅ Generated ${captions.length} captions`);
  return captions;
}

// ============ SCENE DETECTION ============

/**
 * Detectar mudanças de cena baseado em análise de áudio
 * (Versão simplificada - em produção usaria análise de vídeo)
 */
export function detectScenes(transcription: Transcription): Array<{
  timestamp: number;
  type: 'cut' | 'fade' | 'dissolve';
  confidence: number;
}> {
  console.log('🎬 Detecting scene changes...');

  const scenes: Array<{
    timestamp: number;
    type: 'cut' | 'fade' | 'dissolve';
    confidence: number;
  }> = [];

  // Detectar pausas longas como possíveis mudanças de cena
  const words = transcription.words;
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;

    if (gap > 2.0) {
      // Pausa maior que 2 segundos
      scenes.push({
        timestamp: words[i - 1].end + gap / 2,
        type: 'fade',
        confidence: Math.min(gap / 5, 1), // Confiança baseada no tamanho da pausa
      });
    }
  }

  console.log(`✅ Detected ${scenes.length} potential scene changes`);
  return scenes;
}

// ============ SILENCE DETECTION ============

/**
 * Detectar períodos de silêncio
 */
export function detectSilences(transcription: Transcription): Array<{
  start: number;
  end: number;
  duration: number;
}> {
  console.log('🔇 Detecting silence periods...');

  const silences: Array<{
    start: number;
    end: number;
    duration: number;
  }> = [];

  const words = transcription.words;
  for (let i = 1; i < words.length; i++) {
    const silenceStart = words[i - 1].end;
    const silenceEnd = words[i].start;
    const duration = silenceEnd - silenceStart;

    if (duration > 1.0) {
      // Silêncio maior que 1 segundo
      silences.push({
        start: silenceStart,
        end: silenceEnd,
        duration,
      });
    }
  }

  console.log(`✅ Detected ${silences.length} silence periods`);
  return silences;
}

// ============ VOLUME PEAKS ============

/**
 * Detectar picos de volume (simulado baseado em palavras em maiúsculas)
 * Em produção, usaria análise real de áudio
 */
export function detectVolumePeaks(transcription: Transcription): Array<{
  timestamp: number;
  volume: number;
}> {
  console.log('📢 Detecting volume peaks...');

  const peaks: Array<{
    timestamp: number;
    volume: number;
  }> = [];

  const words = transcription.words;
  for (const word of words) {
    // Palavras em maiúsculas ou com pontuação forte indicam ênfase
    const hasEmphasis =
      word.word === word.word.toUpperCase() ||
      word.word.includes('!') ||
      word.word.includes('?');

    if (hasEmphasis) {
      peaks.push({
        timestamp: word.start,
        volume: 0.8 + Math.random() * 0.2, // Simular volume alto
      });
    }
  }

  console.log(`✅ Detected ${peaks.length} volume peaks`);
  return peaks;
}

// ============ COMPLETE ANALYSIS ============

/**
 * Análise completa do vídeo
 */
export async function analyzeVideo(audioBuffer: Buffer): Promise<{
  transcription: Transcription;
  analysis: AIAnalysis;
  captions: Array<{
    text: string;
    start_time: number;
    end_time: number;
    is_highlighted: boolean;
    highlight_words: string[];
  }>;
}> {
  console.log('🚀 Starting complete video analysis...');

  // 1. Transcrever áudio
  const transcription = await transcribeAudio(audioBuffer);

  // 2. Analisar viralidade
  const viralityAnalysis = await analyzeVirality(transcription);

  // 3. Detectar cenas, silêncios e picos
  const sceneChanges = detectScenes(transcription);
  const silencePeriods = detectSilences(transcription);
  const volumePeaks = detectVolumePeaks(transcription);

  // 4. Combinar análises
  const analysis: AIAnalysis = {
    ...viralityAnalysis,
    scene_changes: sceneChanges,
    silence_periods: silencePeriods,
    volume_peaks: volumePeaks,
  };

  // 5. Gerar legendas
  const viralKeywords = analysis.keywords.map((k) => k.word.toLowerCase());
  const captions = generateCaptions(transcription, viralKeywords);

  console.log('✅ Complete video analysis finished');

  return {
    transcription,
    analysis,
    captions,
  };
}

// ============ MOCK FUNCTIONS (para desenvolvimento sem OpenAI) ============

/**
 * Mock de transcrição para testes
 */
export function mockTranscription(): Transcription {
  return {
    text: 'Este é um vídeo incrível sobre como criar conteúdo viral. Você não vai acreditar no que acontece a seguir!',
    words: [
      { word: 'Este', start: 0, end: 0.5, confidence: 0.99 },
      { word: 'é', start: 0.5, end: 0.7, confidence: 0.99 },
      { word: 'um', start: 0.7, end: 0.9, confidence: 0.99 },
      { word: 'vídeo', start: 0.9, end: 1.3, confidence: 0.99 },
      { word: 'incrível', start: 1.3, end: 1.9, confidence: 0.99 },
    ],
    language: 'pt',
    duration: 10,
  };
}

/**
 * Mock de análise para testes
 */
export function mockAnalysis(): AIAnalysis {
  return {
    virality_score: 0.85,
    emotion_peaks: [
      { timestamp: 5.2, emotion: 'surprise', intensity: 0.9 },
      { timestamp: 8.7, emotion: 'joy', intensity: 0.8 },
    ],
    keywords: [
      { word: 'incrível', frequency: 3, relevance: 0.9, timestamps: [1.3, 5.2, 8.1] },
      { word: 'viral', frequency: 2, relevance: 0.85, timestamps: [2.1, 7.3] },
    ],
    topics: ['marketing digital', 'redes sociais', 'conteúdo viral'],
    suggested_title: '🔥 Como Criar Conteúdo VIRAL em 2024 (Método Comprovado)',
    suggested_description:
      'Descubra o método exato que usei para criar vídeos virais que alcançaram milhões de visualizações. Passo a passo completo!',
    suggested_hashtags: ['#viral', '#marketingdigital', '#redessociais', '#conteudo', '#dicas'],
    suggested_ctas: ['Deixe seu like!', 'Compartilhe com seus amigos!', 'Inscreva-se no canal!'],
    scene_changes: [{ timestamp: 5.0, type: 'fade', confidence: 0.8 }],
    silence_periods: [{ start: 4.5, end: 5.5, duration: 1.0 }],
    volume_peaks: [
      { timestamp: 1.3, volume: 0.9 },
      { timestamp: 8.7, volume: 0.95 },
    ],
  };
}

export default {
  transcribeAudio,
  analyzeVirality,
  generateCaptions,
  detectScenes,
  detectSilences,
  detectVolumePeaks,
  analyzeVideo,
  mockTranscription,
  mockAnalysis,
};
