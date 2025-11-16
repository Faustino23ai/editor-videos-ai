import { NextRequest, NextResponse } from 'next/server';
import type { Video } from '@/types/video';

// Mock de upload para desenvolvimento
// Em produção, conectar com Supabase Storage e processamento real

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const style = formData.get('style') as string;
    const pace = formData.get('pace') as string;
    const colors = formData.get('colors') as string;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Nenhum arquivo de vídeo fornecido' },
        { status: 400 }
      );
    }

    // Validações
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 500MB' },
        { status: 400 }
      );
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use MP4 ou MOV' },
        { status: 400 }
      );
    }

    // Gerar ID único para o vídeo
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mock de vídeo processado (em desenvolvimento)
    const mockVideo: Video = {
      id: videoId,
      user_id: 'demo_user',
      title: videoFile.name.replace(/\.[^/.]+$/, ''),
      original_url: '', // Em produção, fazer upload para Supabase Storage
      processed_url: '', // Será preenchido após processamento
      thumbnail_url: '',
      status: 'processing',
      duration: 0,
      format: videoFile.type.split('/')[1],
      aspect_ratio: '16:9',
      style_config: {
        style: style as any,
        pace: pace as any,
        colors: JSON.parse(colors || '{}'),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`✅ Video uploaded: ${videoId}`);

    // Em produção:
    // 1. Upload do arquivo para Supabase Storage
    // 2. Criar registro no banco de dados
    // 3. Adicionar job à fila de processamento
    // 4. Retornar vídeo com status 'processing'

    return NextResponse.json({
      success: true,
      video: mockVideo,
      message: 'Vídeo enviado com sucesso! Iniciando processamento...',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao processar upload',
      },
      { status: 500 }
    );
  }
}
