'use client';

import { useState } from 'react';
import {
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Hash,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Video } from '@/types/video';

interface VideoPreviewProps {
  video: Video;
  onNewVideo: () => void;
}

export default function VideoPreview({ video, onNewVideo }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = async () => {
    if (!video.processed_url) return;

    try {
      const response = await fetch(video.processed_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viralcut_${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const viralityScore = video.ai_analysis?.virality_score || 0;
  const viralityPercentage = Math.round(viralityScore * 100);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-200">
          <Sparkles className="h-4 w-4" />
          <span>Vídeo processado com sucesso!</span>
        </div>

        <h2 className="mb-2 text-4xl font-bold text-white">
          Seu Vídeo Está Pronto! 🎉
        </h2>
        <p className="text-purple-200">
          Confira o resultado e baixe para compartilhar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-black">
            {video.processed_url ? (
              <video
                src={video.processed_url}
                poster={video.thumbnail_url}
                controls
                className="w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Seu navegador não suporta vídeo.
              </video>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-900">
                <p className="text-gray-400">Vídeo não disponível</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              <Download className="mr-2 h-5 w-5" />
              Baixar Vídeo
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onNewVideo}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Novo Vídeo
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="space-y-4">
          {/* Virality Score */}
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">Score de Viralidade</h3>
            </div>

            <div className="mb-4 text-center">
              <div className="mb-2 text-5xl font-bold text-white">
                {viralityPercentage}%
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${viralityPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-center text-sm text-purple-200">
              {viralityPercentage >= 80
                ? '🔥 Altíssimo potencial viral!'
                : viralityPercentage >= 60
                ? '✨ Bom potencial viral'
                : '💡 Potencial moderado'}
            </p>
          </div>

          {/* Suggested Title */}
          {video.ai_analysis?.suggested_title && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Título Sugerido</h3>
              </div>
              <p className="text-sm text-purple-100">
                {video.ai_analysis.suggested_title}
              </p>
            </div>
          )}

          {/* Suggested Description */}
          {video.ai_analysis?.suggested_description && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Descrição</h3>
              </div>
              <p className="text-sm text-purple-200">
                {video.ai_analysis.suggested_description}
              </p>
            </div>
          )}

          {/* Hashtags */}
          {video.ai_analysis?.suggested_hashtags &&
            video.ai_analysis.suggested_hashtags.length > 0 && (
              <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Hashtags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {video.ai_analysis.suggested_hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Video Info */}
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold text-white">Informações</h3>
            <div className="space-y-2 text-sm">
              {video.duration && (
                <div className="flex justify-between">
                  <span className="text-purple-300">Duração:</span>
                  <span className="text-white">
                    {Math.floor(video.duration / 60)}:
                    {(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              {video.format && (
                <div className="flex justify-between">
                  <span className="text-purple-300">Formato:</span>
                  <span className="text-white">{video.format}</span>
                </div>
              )}
              {video.aspect_ratio && (
                <div className="flex justify-between">
                  <span className="text-purple-300">Proporção:</span>
                  <span className="text-white">{video.aspect_ratio}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
