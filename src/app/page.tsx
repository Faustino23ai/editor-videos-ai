'use client';

import { useState } from 'react';
import { Upload, Sparkles, Video, Zap } from 'lucide-react';
import UploadZone from '@/components/custom/upload-zone';
import VideoPreview from '@/components/custom/video-preview';
import ProcessingStatus from '@/components/custom/processing-status';
import type { Video as VideoType, StyleConfig } from '@/types/video';

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<VideoType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    style: 'modern',
    pace: 'medium',
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
    },
  });

  const handleVideoUploaded = (video: VideoType) => {
    setCurrentVideo(video);
    setIsProcessing(true);
  };

  const handleProcessingComplete = (video: VideoType) => {
    setCurrentVideo(video);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ViralCut AI</h1>
                <p className="text-sm text-purple-200">Editor de Vídeo Autônomo</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!currentVideo ? (
          /* Upload Section */
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-200 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>IA que edita vídeos automaticamente</span>
              </div>

              <h2 className="mb-4 text-5xl font-bold text-white md:text-6xl">
                Transforme vídeos em
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {' '}
                  conteúdo viral
                </span>
              </h2>

              <p className="mx-auto max-w-2xl text-lg text-purple-200 md:text-xl">
                Upload de vídeo bruto → IA edita automaticamente → Vídeo viral pronto para download
              </p>
            </div>

            {/* Features Grid */}
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <Video className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Corte Inteligente</h3>
                <p className="text-sm text-purple-200">
                  Remove silêncios e detecta os melhores momentos automaticamente
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Legendas Dinâmicas</h3>
                <p className="text-sm text-purple-200">
                  Legendas estilo Caption com sincronização perfeita e destaque de palavras
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Análise de Viralidade</h3>
                <p className="text-sm text-purple-200">
                  IA sugere títulos, descrições e hashtags otimizadas para engajamento
                </p>
              </div>
            </div>

            {/* Upload Zone */}
            <UploadZone
              styleConfig={styleConfig}
              onStyleChange={setStyleConfig}
              onVideoUploaded={handleVideoUploaded}
            />

            {/* Info */}
            <div className="mt-8 text-center text-sm text-purple-300">
              <p>Formatos aceitos: MP4, MOV • Tamanho máximo: 500MB • Duração máxima: 30 minutos</p>
            </div>
          </div>
        ) : (
          /* Processing/Result Section */
          <div className="mx-auto max-w-6xl">
            {isProcessing ? (
              <ProcessingStatus
                videoId={currentVideo.id}
                onComplete={handleProcessingComplete}
              />
            ) : (
              <VideoPreview video={currentVideo} onNewVideo={() => setCurrentVideo(null)} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-purple-300">
            <p>© 2024 ViralCut AI • Desenvolvido com ❤️ e Inteligência Artificial</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
