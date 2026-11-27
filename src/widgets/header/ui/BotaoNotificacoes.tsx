import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@shared/lib';
import { IconeSino } from '@shared/ui';

export interface BotaoNotificacoesProps {
  aoAbrir?: () => void;
}

export const BotaoNotificacoes: React.FC<BotaoNotificacoesProps> = ({
  aoAbrir,
}) => {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const lidarCliqueFora = (evento: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target as Node)
      ) {
        setAberto(false);
      }
    };

    const lidarEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', lidarCliqueFora);
    document.addEventListener('keydown', lidarEscape);
    return () => {
      document.removeEventListener('mousedown', lidarCliqueFora);
      document.removeEventListener('keydown', lidarEscape);
    };
  }, [aberto]);

  const alternarPainel = () => {
    setAberto((anterior) => {
      const novoEstado = !anterior;
      if (novoEstado) {
        aoAbrir?.();
      }
      return novoEstado;
    });
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        onClick={alternarPainel}
        aria-label="Notificações"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer animar-sino-hover',
          aberto
            ? 'border-fire-500/60 bg-night-800 text-ember-400 shadow-[0_0_16px_rgba(255,107,43,0.28)] animar-sino-ativo'
            : 'border-night-700/80 bg-night-900/70 text-night-300 hover:border-fire-500/50 hover:bg-night-800/90 hover:text-ember-400 hover:shadow-[0_0_14px_rgba(255,107,43,0.22)]'
        )}
      >
        <IconeSino tamanho={19} />
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-label="Painel de notificações"
          className="fixed sm:absolute right-3 sm:right-0 top-17 sm:top-12 z-50 w-[calc(100vw-1.5rem)] max-w-80 rounded-2xl border border-night-700/90 bg-night-900/98 p-4 shadow-2xl shadow-black/70 backdrop-blur-xl animar-entrada-painel"
        >
          <div className="flex items-center justify-between border-b border-night-800 pb-3">
            <h3 className="text-sm font-bold text-white">Notificações</h3>
            <span className="rounded-full border border-ember-400/25 bg-fire-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-400">
              Em dia
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-7 text-center space-y-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-night-700/80 bg-night-800/80 text-ember-400/80">
              <IconeSino tamanho={22} />
            </div>
            <p className="text-xs font-medium text-night-200">
              Nenhuma notificação nova
            </p>
            <p className="text-xs leading-relaxed text-night-400 max-w-60">
              Tudo tranquilo ao redor da fogueira. Novas atividades e alertas
              aparecerão aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
