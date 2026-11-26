import React from 'react';
import type { JogoResumo } from '../model/tipos';

interface JogosFavoritosGridProps {
  jogos: JogoResumo[];
  aoAdicionarFavorito?: () => void;
}

export const JogosFavoritosGrid: React.FC<JogosFavoritosGridProps> = ({
  jogos,
  aoAdicionarFavorito,
}) => {
  // Garantir exatamente 4 slots para o visual clássico do Letterboxd
  const slots = Array.from({ length: 4 }).map((_, idx) => jogos[idx] || null);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 border-b border-night-800 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-night-400">
          Jogos Favoritos
        </h2>
        {jogos.length === 0 && (
          <span className="text-xs text-night-400">
            Não se esqueça de selecionar seus 4 jogos favoritos!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {slots.map((jogo, index) => {
          if (!jogo) {
            return (
              <button
                key={`slot-vazio-${index}`}
                onClick={aoAdicionarFavorito}
                type="button"
                className="group aspect-[2/3] w-full rounded-lg border-2 border-dashed border-night-700/80 hover:border-fire-500/80 bg-night-950/40 hover:bg-night-800/40 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer shadow-inner"
              >
                <div className="h-9 w-9 rounded-full bg-night-800 group-hover:bg-fire-600/20 group-hover:text-fire-400 text-night-400 flex items-center justify-center text-lg mb-2 transition-colors">
                  +
                </div>
                <span className="text-xs font-semibold text-night-400 group-hover:text-night-200">
                  Adicionar Jogo
                </span>
              </button>
            );
          }

          return (
            <div
              key={jogo.steamAppId}
              className="group relative flex flex-col aspect-[2/3] rounded-lg overflow-hidden bg-night-800 border border-night-700/80 hover:border-fire-500 transition-all duration-300 shadow-md hover:shadow-fire-500/10 cursor-pointer"
            >
              <img
                src={jogo.imagemCapaUrl}
                alt={jogo.nome}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Overlay com nota e nome ao passar o mouse */}
              <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                  {jogo.nome}
                </p>
                <div className="flex items-center justify-between mt-1 text-[11px] text-ember-400 font-medium">
                  <span>★ {jogo.avaliacaoUsuario ?? 5}</span>
                  {jogo.anoLancamento && (
                    <span className="text-night-400">{jogo.anoLancamento}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
