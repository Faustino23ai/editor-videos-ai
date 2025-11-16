import { NextRequest, NextResponse } from 'next/server';

// Mock de status de processamento para desenvolvimento
// Em produção, consultar Redis/Supabase para status real

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId;

    if (!videoId) {
      return NextResponse.json(
        { error: 'ID do vídeo não fornecido' },
        { status: 400 }
      );
    }

    // Simular progresso de processamento (mock para desenvolvimento)
    // Em produção, consultar getJobStatus(videoId) do Redis
    
    const mockProgress = Math.min(100, Math.floor(Math.random() * 100) + 1);
    const steps = [
      'Validating video',
      'Extracting audio',
      'Analyzing with AI',
      'Generating visual effects',
      'Rendering video',
      'Generating thumbnail',
      'Finalizing',
    ];
    
    const currentStepIndex = Math.floor((mockProgress / 100) * steps.length);
    const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
    
    // Calcular tempo restante baseado no progresso
    const timeRemaining = Math.max(0, Math.round((100 - mockProgress) * 1.2));

    // Se completou (100%), retornar vídeo processado
    if (mockProgress >= 100) {
      return NextResponse.json({
        status: 'completed',
        progress: 100,
        currentStep: 'Completed',
        timeRemaining: 0,
        video: {
          id: videoId,
          user_id: 'demo_user',
          title: 'Vídeo Processado',
          original_url: '',
          processed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Vídeo de exemplo
          thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
          status: 'completed',
          duration: 120,
          format: 'mp4',
          aspect_ratio: '16:9',
          ai_analysis: {
            virality_score: 0.85,
            suggested_title: '🔥 Vídeo Incrível que Vai Viralizar!',
            suggested_description: 'Este vídeo foi otimizado pela IA para máximo engajamento. Compartilhe agora!',
            suggested_hashtags: ['#viral', '#trending', '#ai', '#videoediting'],
            emotion_peaks: [],
            scene_changes: [],
            audio_quality: 0.9,
            visual_quality: 0.95,
          },
          style_config: {
            style: 'modern',
            pace: 'medium',
            colors: {
              primary: '#FF6B6B',
              secondary: '#4ECDC4',
              accent: '#FFE66D',
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Retornar status de processamento
    return NextResponse.json({
      status: 'processing',
      progress: mockProgress,
      currentStep,
      timeRemaining,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro ao verificar status',
        progress: 0,
      },
      { status: 500 }
    );
  }
}
