import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@shared/lib';
import { IconeLixeira, IconeTresPontos } from '@shared/ui';

export interface MenuOpcoesPostProps {
  aoConfirmarExclusao: () => void | Promise<void>;
  tamanho?: 'compacto' | 'medio';
}

export const MenuOpcoesPost: React.FC<MenuOpcoesPostProps> = ({
  aoConfirmarExclusao,
  tamanho = 'compacto',
}) => {
  const [aberto, setAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const lidarCliqueFora = (evento: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target as Node)
      ) {
        setAberto(false);
        setConfirmando(false);
      }
    };

    const lidarEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAberto(false);
        setConfirmando(false);
      }
    };

    document.addEventListener('mousedown', lidarCliqueFora);
    document.addEventListener('keydown', lidarEscape);
    return () => {
      document.removeEventListener('mousedown', lidarCliqueFora);
      document.removeEventListener('keydown', lidarEscape);
    };
  }, [aberto]);

  const alternarMenu = () => {
    setAberto((atual) => {
      const proximo = !atual;
      if (!proximo) {
        setConfirmando(false);
      }
      return proximo;
    });
  };

  const executarExclusao = async () => {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await aoConfirmarExclusao();
      setAberto(false);
    } finally {
      setExcluindo(false);
      setConfirmando(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={alternarMenu}
        aria-label="Opções do post"
        aria-expanded={aberto}
        aria-haspopup="menu"
        title="Opções do post"
        className={cn(
          'inline-flex items-center justify-center rounded-lg border transition-colors cursor-pointer',
          tamanho === 'medio' ? 'h-8 w-8' : 'h-6.5 w-6.5',
          aberto
            ? 'border-fire-500/50 bg-night-800 text-ember-300'
            : 'border-night-700/80 bg-night-900/80 text-night-400 hover:border-night-600 hover:bg-night-800 hover:text-white'
        )}
      >
        <IconeTresPontos tamanho={tamanho === 'medio' ? 16 : 14} />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Menu do post"
          className="absolute right-0 top-full mt-1.5 z-30 min-w-[180px] rounded-xl border border-night-700/90 bg-night-950/98 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl animar-entrada-painel"
        >
          {!confirmando ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmando(true)}
              aria-label="Excluir post"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-300 hover:bg-red-950/55 hover:text-red-200 transition-colors cursor-pointer"
            >
              <IconeLixeira tamanho={14} className="shrink-0 text-red-400" />
              <span>Excluir post</span>
            </button>
          ) : (
            <div className="p-2 space-y-2">
              <p className="text-[11px] font-medium text-night-200 leading-snug">
                Tem certeza que deseja excluir este post?
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={executarExclusao}
                  aria-label="Confirmar exclusão do post"
                  className="flex-1 rounded-lg border border-red-500/60 bg-red-950/75 px-2.5 py-1.5 text-[11px] font-bold text-red-200 hover:bg-red-900/85 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {excluindo ? 'Excluindo...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => setConfirmando(false)}
                  aria-label="Cancelar exclusão"
                  className="rounded-lg border border-night-700 bg-night-800/80 px-2.5 py-1.5 text-[11px] font-semibold text-night-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
