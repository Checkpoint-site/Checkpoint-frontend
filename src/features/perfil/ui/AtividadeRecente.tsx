import React from 'react';
import type { JogoResumo } from '../model/tipos';

interface AtividadeRecenteProps {
  jogos: JogoResumo[];
}

export const AtividadeRecente: React.FC<AtividadeRecenteProps> = ({ jogos }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 border-b border-night-800 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-night-400">
          Atividade Recente
        </h2>
        <span className="text-[11px] font-semibold text-ember-400 hover:text-ember-300 cursor-pointer">
          Ver Tudo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {jogos.map((jogo) => (
          <div
            key={`atividade-${jogo.steamAppId}`}
            className="flex flex-col group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-night-800 border border-night-700/80 group-hover:border-ember-400 transition-all shadow-md">
              <img
                src={jogo.imagemCapaUrl}
                alt={jogo.nome}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <div className="mt-2 flex flex-col">
              <h3 className="text-xs font-bold text-white group-hover:text-ember-400 transition-colors line-clamp-1">
                {jogo.nome}
              </h3>
              <div className="flex items-center justify-between mt-0.5 text-[11px]">
                <div className="text-ember-400 font-bold">
                  {'★'.repeat(Math.floor(jogo.avaliacaoUsuario || 5))}
                  {(jogo.avaliacaoUsuario || 5) % 1 !== 0 ? '½' : ''}
                </div>
                {jogo.dataRegistro && (
                  <span className="text-[10px] text-night-400">
                    {jogo.dataRegistro}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
