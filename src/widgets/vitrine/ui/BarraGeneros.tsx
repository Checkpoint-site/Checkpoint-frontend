import React from 'react';
import type { GeneroJogo } from '@entities/index';
import { cn } from '@shared/lib';

interface BarraGenerosProps {
  generos: GeneroJogo[];
  generoSelecionado: string;
  aoSelecionarGenero: (slug: string) => void;
}

export const BarraGeneros: React.FC<BarraGenerosProps> = ({
  generos,
  generoSelecionado,
  aoSelecionarGenero,
}) => {
  return (
    <div
      className="mx-auto max-w-[1600px] px-6 sm:px-10 pt-6 pb-2"
      role="navigation"
      aria-label="Filtrar jogos por gênero"
    >
      <div className="flex items-center gap-2 overflow-x-auto ocultar-scrollbar pb-1">
        {generos.map((genero) => {
          const ativo = genero.slug === generoSelecionado;
          return (
            <button
              key={genero.slug}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoSelecionarGenero(genero.slug)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer border',
                ativo
                  ? 'bg-linear-to-r from-fire-600 to-ember-500 text-white border-ember-400/40 shadow-md shadow-fire-500/20'
                  : 'bg-night-800/80 text-night-300 border-night-700/80 hover:border-fire-500/40 hover:text-white hover:bg-night-800'
              )}
            >
              {genero.nome}
            </button>
          );
        })}
      </div>
    </div>
  );
};
