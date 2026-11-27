import React from 'react';
import { Link } from 'react-router-dom';
import type { JogoResumo } from '@entities/index';
import { rotaJogo } from '@shared/config';
import { cn } from '@shared/lib';
import { IconeChamaNota } from '@shared/ui';
import { CapaJogoEstilizada } from './CapaJogoEstilizada';

interface CardJogoProps {
  jogo: JogoResumo;
  posicaoRanking?: number;
  jogado?: boolean;
  queroJogar?: boolean;
  favorito?: boolean;
  notaUsuario?: number;
  aoAlternarJogado: (jogoId: string) => void;
  aoAlternarQueroJogar: (jogoId: string) => void;
  aoAbrirAvaliacao: (jogo: JogoResumo) => void;
}

export const CardJogo: React.FC<CardJogoProps> = ({
  jogo,
  posicaoRanking,
  jogado = false,
  queroJogar = false,
  favorito = false,
  notaUsuario,
  aoAlternarJogado,
  aoAlternarQueroJogar,
  aoAbrirAvaliacao,
}) => {
  const isTop10 = typeof posicaoRanking === 'number';

  return (
    <article
      className={cn(
        'group relative shrink-0 flex items-end snap-start',
        isTop10 ? 'w-[190px] sm:w-[220px] pl-8 sm:pl-10' : 'w-[155px] sm:w-[180px]'
      )}
    >
      {/* Número gigante estilo Top 10 Netflix */}
      {isTop10 && (
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -left-1 bottom-0 z-0 text-[96px] sm:text-[116px] font-black leading-[0.82] tracking-tighter numero-ranking-netflix transition-transform duration-300 group-hover:scale-105"
        >
          {posicaoRanking}
        </span>
      )}

      {/* Pôster vertical 2:3 */}
      <div
        className={cn(
          'relative z-10 w-full aspect-[2/3] rounded-xl overflow-hidden bg-night-800 ring-1 ring-white/10',
          'transition-all duration-300 ease-out',
          'group-hover:scale-[1.04] group-hover:z-20 group-hover:ring-fire-500/80 group-hover:shadow-[0_16px_38px_-10px_rgba(255,107,43,0.48)]'
        )}
      >
        <Link
          to={rotaJogo(jogo.id)}
          aria-label={`Abrir página de ${jogo.titulo}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
        >
          <CapaJogoEstilizada jogo={jogo} />
        </Link>

        {/* Selo discreto de nota no canto superior direito */}
        {(() => {
          const notaExibida =
            typeof notaUsuario === 'number' && notaUsuario > 0
              ? notaUsuario
              : jogo.notaMedia > 0
                ? jogo.notaMedia
                : 0;

          if (notaExibida <= 0) {
            return (
              <div className="pointer-events-none absolute top-2.5 right-2.5 z-20 rounded-md bg-night-950/85 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-night-300 border border-white/10">
                Ainda não avaliado
              </div>
            );
          }

          return (
            <div
              className={cn(
                'pointer-events-none absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-md backdrop-blur-md px-2 py-0.5 text-[11px] font-bold border',
                notaUsuario
                  ? 'bg-fire-600/90 text-white border-ember-300/40 shadow'
                  : 'bg-night-950/80 text-ember-400 border-white/10'
              )}
              title={
                notaUsuario
                  ? `Sua nota: ${notaUsuario.toFixed(1)}`
                  : `Média da comunidade: ${jogo.notaMedia.toFixed(1)}`
              }
            >
              <IconeChamaNota tamanho={12} />
              <span>{notaExibida.toFixed(1)}</span>
            </div>
          );
        })()}

        {/* Indicadores de status do usuário */}
        {(jogado || queroJogar || favorito) && (
          <div className="pointer-events-none absolute top-2.5 left-2.5 z-20 flex items-center gap-1">
            {favorito && (
              <span
                title="Favorito"
                className="rounded-md bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
              >
                ♥
              </span>
            )}
            {jogado && (
              <span
                title="Jogado"
                className="rounded-md bg-fire-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
              >
                ✓
              </span>
            )}
            {queroJogar && (
              <span
                title="Quero jogar"
                className="rounded-md bg-night-950/85 border border-ember-400/50 px-1.5 py-0.5 text-[10px] font-bold text-ember-300 shadow"
              >
                +Lista
              </span>
            )}
          </div>
        )}

        {/* Painel rápido no hover (estilo Netflix) */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-20 p-3 pt-10',
            'bg-linear-to-t from-night-950 via-night-950/94 to-transparent',
            'opacity-0 translate-y-2 transition-all duration-200',
            'group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0'
          )}
        >
          <Link
            to={rotaJogo(jogo.id)}
            className="block text-xs font-bold text-white hover:text-ember-300 truncate transition-colors"
          >
            {jogo.titulo}
          </Link>
          <p className="text-[11px] text-night-300 truncate mb-2.5">
            {jogo.generos.slice(0, 2).join(' · ')}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                aoAlternarJogado(jogo.id);
              }}
              aria-label={jogado ? `Remover ${jogo.titulo} de jogados` : `Marcar ${jogo.titulo} como jogado`}
              title="Joguei"
              className={cn(
                'flex-1 rounded-lg py-1.5 text-[11px] font-semibold border transition-colors cursor-pointer',
                jogado
                  ? 'bg-fire-500 text-white border-fire-400'
                  : 'bg-night-800/90 text-white border-night-600 hover:border-fire-500/60 hover:bg-night-700'
              )}
            >
              ✓ Joguei
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                aoAlternarQueroJogar(jogo.id);
              }}
              aria-label={
                queroJogar
                  ? `Remover ${jogo.titulo} da lista`
                  : `Adicionar ${jogo.titulo} em quero jogar`
              }
              title="Quero jogar"
              className={cn(
                'rounded-lg px-2 py-1.5 text-[11px] font-semibold border transition-colors cursor-pointer',
                queroJogar
                  ? 'bg-ember-500/20 text-ember-300 border-ember-400/60'
                  : 'bg-night-800/90 text-night-300 border-night-600 hover:text-white hover:border-night-400'
              )}
            >
              {queroJogar ? '✓' : '+'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                aoAbrirAvaliacao(jogo);
              }}
              aria-label={`Avaliar ${jogo.titulo}`}
              title="Avaliar"
              className="rounded-lg px-2 py-1.5 text-[11px] font-semibold border bg-night-800/90 text-ember-400 border-night-600 hover:border-ember-400/70 hover:bg-night-700 transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              <IconeChamaNota tamanho={13} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
