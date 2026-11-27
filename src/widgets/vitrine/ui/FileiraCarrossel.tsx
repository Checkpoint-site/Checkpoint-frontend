import React, { useRef } from 'react';

interface FileiraCarrosselProps {
  id: string;
  titulo: string;
  subtitulo?: string;
  acaoLabel?: string;
  aoClicarAcao?: () => void;
  children: React.ReactNode;
}

export const FileiraCarrossel: React.FC<FileiraCarrosselProps> = ({
  id,
  titulo,
  subtitulo,
  acaoLabel,
  aoClicarAcao,
  children,
}) => {
  const trilhaRef = useRef<HTMLDivElement>(null);

  const rolar = (direcao: 'esquerda' | 'direita') => {
    const el = trilhaRef.current;
    if (!el) return;
    const deslocamento = Math.max(el.clientWidth * 0.78, 320);
    el.scrollBy({
      left: direcao === 'direita' ? deslocamento : -deslocamento,
      behavior: 'smooth',
    });
  };

  return (
    <section aria-labelledby={`titulo-secao-${id}`} className="relative group/secao space-y-3">
      {/* Cabeçalho da fileira */}
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 flex items-end justify-between gap-4">
        <div>
          <h2
            id={`titulo-secao-${id}`}
            className="text-lg sm:text-xl font-bold tracking-tight text-white"
          >
            {titulo}
          </h2>
          {subtitulo && (
            <p className="text-xs sm:text-sm text-night-400 mt-0.5">{subtitulo}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {acaoLabel && aoClicarAcao && (
            <button
              type="button"
              onClick={aoClicarAcao}
              className="text-xs font-semibold text-ember-400 hover:text-ember-300 transition-colors cursor-pointer mr-1"
            >
              {acaoLabel} →
            </button>
          )}

          {/* Controles de rolagem horizontal */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => rolar('esquerda')}
              aria-label={`Rolar ${titulo} para a esquerda`}
              className="h-8 w-8 rounded-full border border-night-700 bg-night-800/80 text-night-300 hover:text-white hover:border-fire-500/60 hover:bg-night-800 transition-colors flex items-center justify-center cursor-pointer"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => rolar('direita')}
              aria-label={`Rolar ${titulo} para a direita`}
              className="h-8 w-8 rounded-full border border-night-700 bg-night-800/80 text-night-300 hover:text-white hover:border-fire-500/60 hover:bg-night-800 transition-colors flex items-center justify-center cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Trilha deslizável com máscaras suaves nas bordas */}
      <div className="relative mx-auto max-w-[1600px]">
        <div
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-night-900 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none hidden sm:block absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-night-900 to-transparent"
        />
        <div
          ref={trilhaRef}
          className="flex items-stretch gap-4 overflow-x-auto ocultar-scrollbar px-6 sm:px-10 py-3 scroll-smooth snap-x snap-proximity"
        >
          {children}
        </div>
      </div>
    </section>
  );
};
