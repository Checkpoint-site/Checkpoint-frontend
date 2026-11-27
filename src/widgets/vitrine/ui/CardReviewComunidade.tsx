import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReviewComunidade } from '@entities/index';
import { rotaJogo, rotaReview } from '@shared/config';
import { cn } from '@shared/lib';
import { IconeChamaNota } from '@shared/ui';
import { CapaJogoEstilizada } from './CapaJogoEstilizada';
import { MenuOpcoesPost } from './MenuOpcoesPost';

interface CardReviewComunidadeProps {
  review: ReviewComunidade;
  curtida: boolean;
  aoAlternarCurtida: (reviewId: string) => void;
  aoExcluir?: (review: ReviewComunidade) => void | Promise<void>;
  ocultarCapa?: boolean;
  larguraCompleta?: boolean;
  totalComentarios?: number;
}

export const CardReviewComunidade: React.FC<CardReviewComunidadeProps> = ({
  review,
  curtida,
  aoAlternarCurtida,
  aoExcluir,
  ocultarCapa = false,
  larguraCompleta = false,
  totalComentarios,
}) => {
  const [spoilerRevelado, setSpoilerRevelado] = useState(false);

  const curtidasSemMinha = review.curtidaPeloUsuario
    ? Math.max(0, review.curtidas - 1)
    : review.curtidas;
  const totalCurtidas = curtidasSemMinha + (curtida ? 1 : 0);
  const mostrarBlurSpoiler = Boolean(review.contemSpoiler) && !spoilerRevelado;
  const podeExcluir = Boolean(review.doUsuarioAtual && aoExcluir);

  return (
    <article
      className={cn(
        'rounded-2xl border border-night-700/80 bg-night-800/75 hover:border-fire-500/40 hover:bg-night-800 transition-all duration-200 p-4 flex gap-3.5 shadow-lg shadow-black/20 snap-start',
        larguraCompleta ? 'w-full' : 'shrink-0 w-[310px] sm:w-[370px]'
      )}
    >
      {/* Mini capa vertical do jogo */}
      {!ocultarCapa && (
        <Link
          to={rotaJogo(review.jogoId)}
          aria-label={`Ver página de ${review.jogoTitulo}`}
          className="shrink-0 w-[72px] h-[106px] rounded-lg overflow-hidden ring-1 ring-white/10 hover:ring-fire-500/60 transition-all"
        >
          <CapaJogoEstilizada
            compacta
            jogo={{
              titulo: review.jogoTitulo,
              ano: review.jogoAno,
              desenvolvedora: '',
              capaUrl: review.jogoCapaUrl,
              corPrimaria: review.jogoCorPrimaria,
              corSecundaria: review.jogoCorSecundaria,
              corAcento: review.jogoCorAcento,
              emblema: 'fogo',
            }}
          />
        </Link>
      )}

      {/* Conteúdo da review */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
        <div>
          {/* Cabeçalho autor + nota + menu de 3 pontinhos */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 shrink-0 rounded-full bg-linear-to-br from-fire-500 to-ember-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                {review.autorIniciais}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{review.autorNome}</p>
                  {review.doUsuarioAtual && (
                    <span className="rounded bg-fire-500/20 border border-fire-500/40 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-ember-300">
                      Você
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-night-400 truncate">
                  {review.autorHandle} · {review.tempoAtras}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-night-900/90 border border-ember-400/25 px-2 py-0.5 text-[11px] font-bold text-ember-400">
                <IconeChamaNota tamanho={12} />
                <span>{review.nota.toFixed(1)}</span>
              </span>

              {podeExcluir && aoExcluir && (
                <MenuOpcoesPost aoConfirmarExclusao={() => aoExcluir(review)} />
              )}
            </div>
          </div>

          {!ocultarCapa && (
            <Link
              to={rotaJogo(review.jogoId)}
              className="inline-block text-[11px] font-semibold text-fire-400 hover:text-ember-300 truncate mb-1 transition-colors"
            >
              {review.jogoTitulo}
            </Link>
          )}

          {/* Tags de destaque da review */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-night-900/80 border border-night-700 px-2 py-0.5 text-[10px] font-medium text-night-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Texto com blur real quando contém spoiler */}
          <div className="relative rounded-xl">
            <p
              aria-hidden={mostrarBlurSpoiler}
              className={cn(
                'text-xs text-night-300 leading-relaxed transition-all duration-300',
                !larguraCompleta && 'line-clamp-3',
                mostrarBlurSpoiler && 'blur-[6px] select-none pointer-events-none opacity-75'
              )}
            >
              &ldquo;{review.comentario}&rdquo;
            </p>

            {mostrarBlurSpoiler && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-night-950/45 backdrop-blur-[2px] px-3 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ember-300">
                  Contém spoilers
                </span>
                <button
                  type="button"
                  onClick={() => setSpoilerRevelado(true)}
                  className="rounded-lg border border-fire-500/60 bg-night-900/90 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-fire-500/20 hover:border-fire-400 transition-colors cursor-pointer shadow"
                >
                  Ver assim mesmo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé curtir + abrir comentários */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => aoAlternarCurtida(review.id)}
              aria-pressed={curtida}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer border',
                curtida
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-night-900/60 text-night-300 border-night-700 hover:border-rose-500/40 hover:text-white'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill={curtida ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{totalCurtidas}</span>
            </button>

            <Link
              to={rotaReview(review.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-night-700 bg-night-900/60 px-2.5 py-1 text-[11px] font-semibold text-night-300 hover:border-fire-500/40 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>
                {typeof totalComentarios === 'number' && totalComentarios > 0
                  ? `${totalComentarios}`
                  : 'Comentar'}
              </span>
            </Link>
          </div>

          {!ocultarCapa && (
            <Link
              to={rotaJogo(review.jogoId)}
              className="text-[11px] font-medium text-night-400 hover:text-ember-300 transition-colors"
            >
              Ver jogo →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
