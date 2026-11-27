import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  COMENTARIOS_INICIAIS_MOCK,
  REVIEWS_INICIAIS_MOCK,
  adaptarComentarioBackend,
  adaptarPostBackend,
  buscarJogoNoCatalogo,
  useBibliotecaFogueira,
  type ComentarioReview,
  type ReviewComunidade,
} from '@entities/index';
import { postsApi } from '@shared/api';
import { ROTAS, rotaAvaliarJogo, rotaJogo, rotaReview } from '@shared/config';
import { cn } from '@shared/lib';
import { Botao, IconeChamaNota } from '@shared/ui';
import { CapaJogoEstilizada, MenuOpcoesPost } from '@widgets/index';

const ItemComentario: React.FC<{ comentario: ComentarioReview }> = ({ comentario }) => {
  const [spoilerRevelado, setSpoilerRevelado] = useState(false);
  const mostrarBlur = Boolean(comentario.contemSpoiler) && !spoilerRevelado;

  return (
    <article className="rounded-2xl border border-night-700/80 bg-night-800/65 p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-fire-600 to-ember-500 text-[11px] font-bold text-white flex items-center justify-center">
            {comentario.autorIniciais}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-white truncate">{comentario.autorNome}</p>
              {comentario.doUsuarioAtual && (
                <span className="rounded bg-fire-500/20 border border-fire-500/40 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-ember-300">
                  Você
                </span>
              )}
            </div>
            <p className="text-[11px] text-night-400 truncate">
              {comentario.autorHandle} · {comentario.tempoAtras}
            </p>
          </div>
        </div>

        {comentario.contemSpoiler && (
          <span className="rounded-full border border-ember-400/30 bg-ember-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-ember-300">
            Spoiler
          </span>
        )}
      </div>

      <div className="relative rounded-xl">
        <p
          aria-hidden={mostrarBlur}
          className={cn(
            'text-sm text-night-200 leading-relaxed transition-all duration-300',
            mostrarBlur && 'blur-[6px] select-none pointer-events-none opacity-75'
          )}
        >
          {comentario.texto}
        </p>

        {mostrarBlur && (
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2.5 rounded-xl bg-night-950/50 backdrop-blur-[2px] px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ember-300">
              Contém spoilers
            </span>
            <button
              type="button"
              onClick={() => setSpoilerRevelado(true)}
              className="rounded-lg border border-fire-500/60 bg-night-900/90 px-3 py-1 text-xs font-semibold text-white hover:bg-fire-500/20 hover:border-fire-400 transition-colors cursor-pointer shadow"
            >
              Ver assim mesmo
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export const PaginaReview: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const {
    reviewsUsuario,
    reviewsCurtidas,
    comentariosUsuario,
    reviewsExcluidas,
    alternarCurtidaReview,
    excluirReview,
    adicionarComentarioReview,
  } = useBibliotecaFogueira();

  const [spoilerReviewRevelado, setSpoilerReviewRevelado] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarioComSpoiler, setComentarioComSpoiler] = useState(false);
  const [reviewRemota, setReviewRemota] = useState<ReviewComunidade | null>(null);
  const [comentariosRemotos, setComentariosRemotos] = useState<ComentarioReview[] | null>(
    null
  );
  const [outrasReviewsRemotas, setOutrasReviewsRemotas] = useState<ReviewComunidade[] | null>(
    null
  );
  const [carregandoRemota, setCarregandoRemota] = useState<boolean>(
    () => /^\d+$/.test(id.trim())
  );

  const todasReviewsLocais = useMemo(
    () => [...reviewsUsuario, ...REVIEWS_INICIAIS_MOCK],
    [reviewsUsuario]
  );

  const reviewLocal = useMemo(
    () => todasReviewsLocais.find((item) => item.id === id),
    [todasReviewsLocais, id]
  );

  const reviewBruta = reviewRemota ?? reviewLocal;
  const review = reviewBruta && !reviewsExcluidas[reviewBruta.id] ? reviewBruta : undefined;

  const jogo = useMemo(
    () => (review ? buscarJogoNoCatalogo(review.jogoId) : undefined),
    [review]
  );

  useEffect(() => {
    setSpoilerReviewRevelado(false);
    setNovoComentario('');
    setComentarioComSpoiler(false);
    setReviewRemota(null);
    setComentariosRemotos(null);
    setOutrasReviewsRemotas(null);

    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } catch {
      // Ambiente de teste sem suporte a scrollTo
    }

    const limpo = id.trim();
    if (!/^\d+$/.test(limpo)) {
      setCarregandoRemota(false);
      return;
    }

    let ativo = true;
    setCarregandoRemota(!reviewLocal);

    postsApi
      .obterComComentarios(Number(limpo))
      .then((dto) => {
        if (!ativo) return;
        setReviewRemota(adaptarPostBackend(dto.review));
        setComentariosRemotos(dto.comentarios.map(adaptarComentarioBackend));
        setOutrasReviewsRemotas(dto.outrasReviews.map(adaptarPostBackend));
      })
      .catch(() => {
        // Usa estado local de fallback
      })
      .finally(() => {
        if (ativo) setCarregandoRemota(false);
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const comentarios = useMemo(() => {
    if (!review) return [];
    const doUsuario = comentariosUsuario.filter((c) => c.reviewId === review.id);
    const base =
      comentariosRemotos !== null
        ? comentariosRemotos
        : COMENTARIOS_INICIAIS_MOCK.filter((c) => c.reviewId === review.id);

    const idsBase = new Set(base.map((c) => c.id));
    return [...doUsuario.filter((c) => !idsBase.has(c.id)), ...base];
  }, [review, comentariosUsuario, comentariosRemotos]);

  const outrasReviews = useMemo(() => {
    const base =
      outrasReviewsRemotas && outrasReviewsRemotas.length > 0
        ? outrasReviewsRemotas
        : todasReviewsLocais.filter((item) => item.id !== id).slice(0, 4);
    return base.filter((item) => !reviewsExcluidas[item.id]);
  }, [outrasReviewsRemotas, todasReviewsLocais, id, reviewsExcluidas]);

  if (carregandoRemota && !review) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
          Checkpoint · Conversa na Fogueira
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Carregando review...
        </h1>
      </section>
    );
  }

  if (!review) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
          Checkpoint · Comentários
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Review não encontrada
        </h1>
        <p className="text-sm sm:text-base text-night-300">
          Essa conversa não existe ou foi removida. Volte para a vitrine principal para ver outras
          reviews da comunidade.
        </p>
        <div className="pt-2">
          <Link to={ROTAS.INICIO}>
            <Botao variante="primario" tamanho="medio">
              Voltar para a Fogueira
            </Botao>
          </Link>
        </div>
      </section>
    );
  }

  const curtida = reviewsCurtidas[review.id] ?? Boolean(review.curtidaPeloUsuario);
  const curtidasSemMinha = review.curtidaPeloUsuario
    ? Math.max(0, review.curtidas - 1)
    : review.curtidas;
  const totalCurtidas = curtidasSemMinha + (curtida ? 1 : 0);
  const mostrarBlurReview = Boolean(review.contemSpoiler) && !spoilerReviewRevelado;

  const lidarComEnvioComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    adicionarComentarioReview(review.id, novoComentario, comentarioComSpoiler);
    setNovoComentario('');
    setComentarioComSpoiler(false);
  };

  const lidarComConfirmacaoExclusao = async () => {
    const destinoJogo = review.jogoId ? rotaJogo(review.jogoId) : ROTAS.INICIO;
    await excluirReview(review);
    navegar(destinoJogo, { replace: true });
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden pb-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background: `radial-gradient(circle at 75% 15%, ${review.jogoCorSecundaria} 0%, #0b1320 62%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 pt-8 sm:pt-10 space-y-8">
        <nav aria-label="Navegação da discussão" className="flex items-center gap-2 text-xs">
          <Link to={ROTAS.INICIO} className="text-night-400 hover:text-white transition-colors">
            Início
          </Link>
          <span className="text-night-600">/</span>
          <Link
            to={rotaJogo(review.jogoId)}
            className="text-night-400 hover:text-white transition-colors"
          >
            {review.jogoTitulo}
          </Link>
          <span className="text-night-600">/</span>
          <span className="font-semibold text-ember-300">Comentários</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
          <div className="space-y-8">
            <article className="rounded-3xl border border-night-700/90 bg-night-900/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/45 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-linear-to-br from-fire-500 to-ember-500 text-sm font-bold text-white flex items-center justify-center shadow">
                    {review.autorIniciais}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base sm:text-lg font-extrabold text-white">
                        {review.autorNome}
                      </h1>
                      {review.doUsuarioAtual && (
                        <span className="rounded bg-fire-500/20 border border-fire-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ember-300">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-night-400">
                      {review.autorHandle} · {review.tempoAtras} · sobre{' '}
                      <Link
                        to={rotaJogo(review.jogoId)}
                        className="font-semibold text-fire-400 hover:text-ember-300 transition-colors"
                      >
                        {review.jogoTitulo}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-night-950/90 border border-ember-400/30 px-3 py-1.5 text-sm font-extrabold text-ember-400">
                    <IconeChamaNota tamanho={15} />
                    <span>{review.nota.toFixed(1)}</span>
                  </span>

                  {review.doUsuarioAtual && (
                    <MenuOpcoesPost
                      tamanho="medio"
                      aoConfirmarExclusao={lidarComConfirmacaoExclusao}
                    />
                  )}
                </div>
              </div>

              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-night-700 bg-night-800/80 px-2.5 py-1 text-[11px] font-medium text-night-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="relative rounded-2xl">
                <p
                  aria-hidden={mostrarBlurReview}
                  className={cn(
                    'text-base sm:text-lg text-night-100 leading-relaxed transition-all duration-300',
                    mostrarBlurReview && 'blur-[8px] select-none pointer-events-none opacity-75'
                  )}
                >
                  &ldquo;{review.comentario}&rdquo;
                </p>

                {mostrarBlurReview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-night-950/55 backdrop-blur-[2px] p-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-ember-300">
                      Contém spoilers
                    </span>
                    <button
                      type="button"
                      onClick={() => setSpoilerReviewRevelado(true)}
                      className="rounded-xl border border-fire-500/70 bg-night-900/95 px-4 py-2 text-xs font-semibold text-white hover:bg-fire-500/20 hover:border-fire-400 transition-colors cursor-pointer shadow-lg"
                    >
                      Ver assim mesmo
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-night-800">
                <button
                  type="button"
                  onClick={() => alternarCurtidaReview(review.id)}
                  aria-pressed={curtida}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer border',
                    curtida
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-night-950/70 text-night-300 border-night-700 hover:border-rose-500/40 hover:text-white'
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill={curtida ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{totalCurtidas} curtidas</span>
                </button>

                <span className="text-xs text-night-400">
                  {comentarios.length}{' '}
                  {comentarios.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </div>
            </article>

            <section
              aria-labelledby="titulo-responder-review"
              className="rounded-2xl border border-night-700/80 bg-night-900/80 p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="titulo-responder-review" className="text-base font-bold text-white">
                  Deixe seu comentário
                </h2>
                <label className="inline-flex items-center gap-2 text-xs text-night-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={comentarioComSpoiler}
                    onChange={(e) => setComentarioComSpoiler(e.target.checked)}
                    className="accent-fire-500 h-3.5 w-3.5 rounded"
                  />
                  <span>Contém spoilers</span>
                </label>
              </div>

              <form onSubmit={lidarComEnvioComentario} className="space-y-3">
                <textarea
                  aria-label="Escreva um comentário"
                  rows={3}
                  maxLength={600}
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder={`Responda à review de ${review.autorNome}...`}
                  className="w-full rounded-xl border border-night-700 bg-night-950/80 px-4 py-3 text-sm text-white placeholder:text-night-500 focus:border-fire-500 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-night-400 tabular-nums">
                    {novoComentario.length}/600
                  </span>
                  <Botao
                    type="submit"
                    variante="primario"
                    tamanho="pequeno"
                    disabled={!novoComentario.trim()}
                  >
                    Enviar comentário
                  </Botao>
                </div>
              </form>
            </section>

            <section aria-labelledby="titulo-lista-comentarios" className="space-y-4">
              <h2 id="titulo-lista-comentarios" className="text-lg font-bold text-white">
                Comentários ({comentarios.length})
              </h2>

              {comentarios.length > 0 ? (
                <div className="space-y-3">
                  {comentarios.map((comentario) => (
                    <ItemComentario key={comentario.id} comentario={comentario} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-night-700 bg-night-800/35 p-6 text-center">
                  <p className="text-sm font-semibold text-white">Nenhum comentário ainda</p>
                  <p className="text-xs text-night-400 mt-1">
                    Puxe assunto com {review.autorNome} usando a caixa acima.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="rounded-2xl border border-night-700/80 bg-night-900/85 p-4 space-y-4">
              <Link
                to={rotaJogo(review.jogoId)}
                className="block aspect-[2/3] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden ring-1 ring-white/15 hover:ring-fire-500/60 transition-all"
              >
                <CapaJogoEstilizada
                  jogo={{
                    titulo: review.jogoTitulo,
                    ano: review.jogoAno,
                    desenvolvedora: jogo?.desenvolvedora ?? '',
                    capaUrl: review.jogoCapaUrl,
                    corPrimaria: review.jogoCorPrimaria,
                    corSecundaria: review.jogoCorSecundaria,
                    corAcento: review.jogoCorAcento,
                    emblema: jogo?.emblema ?? 'fogo',
                  }}
                />
              </Link>

              <div className="space-y-2 text-center">
                <p className="text-sm font-bold text-white">{review.jogoTitulo}</p>
                <div className="flex flex-col gap-2 pt-1">
                  <Link to={rotaJogo(review.jogoId)}>
                    <Botao variante="secundario" tamanho="pequeno" className="w-full">
                      Ver página do jogo
                    </Botao>
                  </Link>
                  <Link to={rotaAvaliarJogo(review.jogoId)}>
                    <Botao variante="primario" tamanho="pequeno" className="w-full">
                      Avaliar este jogo
                    </Botao>
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-night-700/80 bg-night-900/85 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-night-300">
                Outras reviews na Fogueira
              </h3>
              {outrasReviews.length > 0 ? (
                <div className="space-y-2.5">
                  {outrasReviews.map((item) => (
                    <Link
                      key={item.id}
                      to={rotaReview(item.id)}
                      className="block rounded-xl border border-night-800 bg-night-950/60 p-3 hover:border-fire-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-white truncate">{item.autorNome}</span>
                        <span className="inline-flex items-center gap-1 text-ember-400 font-bold">
                          <IconeChamaNota tamanho={12} />
                          <span>{item.nota.toFixed(1)}</span>
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-fire-400 truncate mt-0.5">
                        {item.jogoTitulo}
                      </p>
                      {item.contemSpoiler ? (
                        <p className="text-[11px] text-ember-300/80 mt-1">
                          Contém spoilers — clique para abrir
                        </p>
                      ) : (
                        <p className="text-[11px] text-night-400 line-clamp-2 mt-1">
                          &ldquo;{item.comentario}&rdquo;
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-night-400 leading-relaxed">
                  Ainda não existem outras avaliações na Fogueira.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
