'use client';

import { useState, useCallback } from 'react';
import { Upload, Palette, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { StyleConfig, Video, VideoStyle, VideoPace } from '@/types/video';

interface UploadZoneProps {
  styleConfig: StyleConfig;
  onStyleChange: (config: StyleConfig) => void;
  onVideoUploaded: (video: Video) => void;
}

export default function UploadZone({
  styleConfig,
  onStyleChange,
  onVideoUploaded,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const videoFile = files.find((file) =>
        file.type.startsWith('video/')
      );

      if (videoFile) {
        await uploadVideo(videoFile);
      } else {
        toast.error('Por favor, envie um arquivo de vídeo válido');
      }
    },
    [styleConfig]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadVideo(file);
      }
    },
    [styleConfig]
  );

  const uploadVideo = async (file: File) => {
    // Validações
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 500MB');
      return;
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use MP4 ou MOV');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Criar FormData
      const formData = new FormData();
      formData.append('video', file);
      formData.append('style', styleConfig.style);
      formData.append('pace', styleConfig.pace);
      formData.append('colors', JSON.stringify(styleConfig.colors));

      // Simular progresso (em produção, usar XMLHttpRequest para progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha no upload');
      }

      const data = await response.json();

      toast.success('Vídeo enviado com sucesso!');
      onVideoUploaded(data.video);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar vídeo'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Style Configuration */}
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Configuração de Estilo
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Style Selector */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-purple-200">
              Estilo das Legendas
            </Label>
            <Select
              value={styleConfig.style}
              onValueChange={(value: VideoStyle) =>
                onStyleChange({ ...styleConfig, style: value })
              }
            >
              <SelectTrigger
                id="style"
                className="border-white/10 bg-white/5 text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">🎨 Moderno</SelectItem>
                <SelectItem value="minimal">✨ Minimalista</SelectItem>
                <SelectItem value="energetic">⚡ Energético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pace Selector */}
          <div className="space-y-2">
            <Label htmlFor="pace" className="text-purple-200">
              Ritmo de Edição
            </Label>
            <Select
              value={styleConfig.pace}
              onValueChange={(value: VideoPace) =>
                onStyleChange({ ...styleConfig, pace: value })
              }
            >
              <SelectTrigger
                id="pace"
                className="border-white/10 bg-white/5 text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">🚀 Rápido</SelectItem>
                <SelectItem value="medium">⚖️ Médio</SelectItem>
                <SelectItem value="intense">🔥 Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-purple-400 bg-purple-500/20'
            : 'border-white/20 bg-white/5'
        } backdrop-blur-sm`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <label
          htmlFor="video-upload"
          className="flex cursor-pointer flex-col items-center justify-center p-12 text-center"
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-purple-400" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">
                  Enviando vídeo...
                </p>
                <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-purple-300">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Upload className="h-10 w-10 text-white" />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-white">
                Arraste seu vídeo aqui
              </h3>
              <p className="mb-4 text-purple-200">
                ou clique para selecionar
              </p>

              <Button
                type="button"
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                <Upload className="mr-2 h-5 w-5" />
                Selecionar Vídeo
              </Button>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
