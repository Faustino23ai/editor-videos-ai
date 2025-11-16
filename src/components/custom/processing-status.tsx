'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Video } from '@/types/video';

interface ProcessingStatusProps {
  videoId: string;
  onComplete: (video: Video) => void;
}

const PROCESSING_STEPS = [
  { key: 'uploading', label: 'Upload do vídeo', icon: '📤' },
  { key: 'validating', label: 'Validando vídeo', icon: '✅' },
  { key: 'extracting', label: 'Extraindo áudio', icon: '🎵' },
  { key: 'analyzing', label: 'Analisando com IA', icon: '🧠' },
  { key: 'generating', label: 'Gerando efeitos', icon: '✨' },
  { key: 'rendering', label: 'Renderizando vídeo', icon: '🎬' },
  { key: 'thumbnail', label: 'Criando thumbnail', icon: '🖼️' },
  { key: 'uploading_final', label: 'Finalizando', icon: '🚀' },
];

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function ProcessingStatus({
  videoId,
  onComplete,
}: ProcessingStatusProps) {
  const [status, setStatus] = useState<{
    progress: number;
    currentStep: string;
    timeRemaining?: number;
    error?: string;
  }>({
    progress: 0,
    currentStep: 'uploading',
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${videoId}`);
        const data = await response.json();

        setStatus({
          progress: data.progress || 0,
          currentStep: data.currentStep || 'processing',
          timeRemaining: data.timeRemaining,
          error: data.error,
        });

        // Se completou, chamar callback
        if (data.status === 'completed' && data.video) {
          clearInterval(intervalId);
          setTimeout(() => {
            onComplete(data.video);
          }, 1000);
        }

        // Se erro, parar polling
        if (data.status === 'error') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    // Verificar status a cada 2 segundos
    intervalId = setInterval(checkStatus, 2000);
    checkStatus(); // Primeira verificação imediata

    return () => clearInterval(intervalId);
  }, [videoId, onComplete]);

  const getCurrentStepIndex = () => {
    const stepMap: Record<string, number> = {
      uploading: 0,
      'Validating video': 1,
      'Extracting audio': 2,
      'Analyzing with AI': 3,
      'Generating visual effects': 4,
      'Rendering video': 5,
      'Generating thumbnail': 6,
      Finalizing: 7,
    };

    return stepMap[status.currentStep] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (status.error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-8 text-center backdrop-blur-sm">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">
            Erro no Processamento
          </h2>
          <p className="mb-6 text-red-200">{status.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm text-purple-200">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>IA trabalhando no seu vídeo</span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-white">
            Processando Vídeo
          </h2>
          
          {/* Tempo Restante */}
          {status.timeRemaining !== undefined && status.timeRemaining > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2">
              <Clock className="h-5 w-5 text-blue-300" />
              <span className="text-lg font-semibold text-blue-200">
                Tempo restante: {formatTime(status.timeRemaining)}
              </span>
            </div>
          )}
          
          {status.progress === 100 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span className="text-lg font-semibold text-green-200">
                Concluído!
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-purple-200">Progresso</span>
            <span className="font-semibold text-white">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-3" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {PROCESSING_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                  isCurrent
                    ? 'bg-purple-500/20 ring-2 ring-purple-500/50'
                    : isCompleted
                    ? 'bg-green-500/10'
                    : 'bg-white/5'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                    isCurrent
                      ? 'bg-purple-500'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-green-200'
                        : 'text-purple-300'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-purple-200">Em andamento...</p>
                  )}
                  {isCompleted && (
                    <p className="text-sm text-green-300">Concluído</p>
                  )}
                </div>

                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-purple-500/10 p-4">
            <p className="text-sm text-purple-200">
              💡 <strong>Você sabia?</strong> Nossa IA analisa mais de 100
              parâmetros para criar o vídeo perfeito!
            </p>
          </div>
          
          <div className="rounded-xl bg-blue-500/10 p-4">
            <p className="text-sm text-blue-200">
              ⚡ <strong>Processamento otimizado:</strong> Garantimos edição
              profissional em até 2 minutos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
