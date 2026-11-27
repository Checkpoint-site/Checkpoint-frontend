import React from 'react';
import type { PerfilUsuario } from '../model/tipos';
import { Botao } from '@shared/ui';

interface CabecalhoPerfilProps {
  perfil: PerfilUsuario;
  aoAbrirEdicao: () => void;
}

export const CabecalhoPerfil: React.FC<CabecalhoPerfilProps> = ({
  perfil,
  aoAbrirEdicao,
}) => {
  return (
    <div className="w-full pb-8 border-b border-night-700/60">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Identificação Esquerda: Avatar + Nome + Bio */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar com moldura de brasa */}
          <div className="relative group">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-night-800 border-2 border-night-600 group-hover:border-fire-500 transition-colors shadow-xl flex items-center justify-center">
              {perfil.fotoPerfil ? (
                <img
                  src={perfil.fotoPerfil}
                  alt={perfil.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-night-800 to-night-700 flex items-center justify-center text-3xl font-bold text-night-300">
                  {perfil.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-fire-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-night-950 shadow-md">
              Nv. {perfil.nivelGamer}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {perfil.nome}
              </h1>
              <Botao
                variante="contorno"
                tamanho="pequeno"
                onClick={aoAbrirEdicao}
                className="text-xs uppercase tracking-wider font-semibold border-night-600 text-night-300 hover:text-white hover:border-night-400 py-1 px-2.5 h-auto"
              >
                Editar Perfil
              </Botao>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-night-300">
              <span className="text-ember-400 font-semibold">{perfil.pontosExperiencia.toLocaleString()} XP</span>
              <span>•</span>
              <span className="text-night-400">@{perfil.nome.toLowerCase().replace(/\s+/g, '')}</span>
            </div>

            {perfil.biografiaGamer && (
              <p className="mt-3 text-sm text-night-200 max-w-xl leading-relaxed">
                {perfil.biografiaGamer}
              </p>
            )}
          </div>
        </div>

        {/* Estatísticas Topo Direito no estilo exato do Letterboxd */}
        <div className="flex items-center justify-center md:justify-end gap-6 sm:gap-8 pt-2 md:pt-0 border-t md:border-t-0 border-night-800">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {perfil.totalJogos}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-night-400">
              Jogos
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {perfil.jogosFinalizadosAno}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-night-400">
              Este Ano
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {perfil.quantidadeSeguindo}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-night-400">
              Seguindo
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {perfil.quantidadeSeguidores}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-night-400">
              Seguidores
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
