import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  COMENTARIOS_INICIAIS_MOCK,
  EVENTO_CATALOGO_ATUALIZADO,
  REVIEWS_INICIAIS_MOCK,
  adaptarDetalhesJogoBackend,
  adaptarPostBackend,
  buscarJogoNoCatalogo,
  obterDistribuicaoConhecidaJogo,
  obterJogosRelacionados,
  resolverSteamAppIdDeJogoId,
  useBibliotecaFogueira,
  type FaixaDistribuicaoNota,
  type JogoResumo,
  type ReviewComunidade,
  type StatusBiblioteca,
} from '@entities/index';
import { catalogoApi, postsApi } from '@shared/api';
import { ROTAS, rotaAvaliarJogo } from '@shared/config';
import { cn } from '@shared/lib';
import { Botao, IconeChamaNota } from '@shared/ui';
import {
  CapaJogoEstilizada,
  CardJogo,
  CardReviewComunidade,
  FileiraCarrossel,
} from '@widgets/index';
import { obterDescricaoNota } from '@widgets/vitrine/ui/ModalAvaliacaoRapida';

type OrdenacaoReviews = 'recentes' | 'curtidas' | 'nota';

const LABELS_STATUS: Record<StatusBiblioteca, string> = {
  zerado: 'Zerado',
  jogando: 'Jogando',
  quero_jogar: 'Quero jogar',
  abandonado: 'Pausado',
};

export const PaginaJogo: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navegar = useNavigate();

  const [jogo, setJogo] = useState<JogoResumo | undefined>(() => buscarJogoNoCatalogo(id));
  const [carregandoJogo, setCarregandoJogo] = useState<boolean>(
    () => !buscarJogoNoCatalogo(id) && /^\d+$/.test(id.trim())
  );
  const [distribuicaoRemota, setDistribuicaoRemota] = useState<FaixaDistribuicaoNota[] | null>(
    null
  );
  const [relacionadosRemotos, setRelacionadosRemotos] = useState<JogoResumo[] | null>(null);
  const [reviewsRemotas, setReviewsRemotas] = useState<ReviewComunidade[] | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoReviews>('recentes');

  const {
    registros,
    reviewsUsuario,
    reviewsCurtidas,
    comentariosUsuario,
    reviewsExcluidas,
    alternarJogado,
    alternarQueroJogar,
    alternarFavorito,
    alternarCurtidaReview,
    excluirReview,
  } = useBibliotecaFogueira();

  useEffect(() => {
    const inicial = buscarJogoNoCatalogo(id);
    setJogo(inicial);
    setDistribuicaoRemota(null);
    setRelacionadosRemotos(null);
    setReviewsRemotas(null);
    setCarregandoJogo(!inicial && /^\d+$/.test(id.trim()));

    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } catch {
      // Ambiente de teste sem suporte a scrollTo
    }

    const steamAppId = resolverSteamAppIdDeJogoId(id);
    if (!steamAppId) return;

    let ativo = true;

    catalogoApi
      .obterDetalhesPorSteamAppId(steamAppId)
      .then((dto) => {
        if (!ativo) return;
        const adaptado = adaptarDetalhesJogoBackend(dto);
        setJogo(adaptado.jogo);
        setDistribuicaoRemota(adaptado.distribuicao);
        if (adaptado.relacionados.length > 0) {
          setRelacionadosRemotos(adaptado.relacionados);
        }
      })
      .catch(() => {
        // Usa catálogo local em memória se a API não responder
      })
      .finally(() => {
        if (ativo) setCarregandoJogo(false);
      });

    const sincronizarDoCache = () => {
      const atualizado = buscarJogoNoCatalogo(id);
      if (atualizado) {
        setJogo(atualizado);
        setDistribuicaoRemota(obterDistribuicaoConhecidaJogo(atualizado));
      }
    };
    window.addEventListener(EVENTO_CATALOGO_ATUALIZADO, sincronizarDoCache);

    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_CATALOGO_ATUALIZADO, sincronizarDoCache);
    };
  }, [id]);

  useEffect(() => {
    const steamAppId = jogo?.steamAppId ?? resolverSteamAppIdDeJogoId(id);
    if (!steamAppId) return;

    let ativo = true;
    postsApi
      .listarPorJogo(steamAppId, ordenacao)
      .then((lista) => {
        if (!ativo) return;
        setReviewsRemotas(lista.map(adaptarPostBackend));
      })
      .catch(() => {
        // Mantém reviews locais de fallback
      });

    return () => {
      ativo = false;
    };
  }, [id, jogo?.steamAppId, ordenacao]);

  const contarComentarios = (review: ReviewComunidade) => {
    const base =
      typeof review.totalComentarios === 'number'
        ? review.totalComentarios
        : COMENTARIOS_INICIAIS_MOCK.filter((c) => c.reviewId === review.id).length;
    const locaisExtras = comentariosUsuario.filter(
      (c) => c.reviewId === review.id && !c.idComentarioBackend
    ).length;
    return base + locaisExtras;
  };

  const registroAtual = jogo ? registros[jogo.id] : undefined;

  const { mediaReal, totalReal, distribuicao } = useMemo(() => {
    const distribuicaoVazia: FaixaDistribuicaoNota[] = [
      { estrelas: 5, percentual: 0 },
      { estrelas: 4, percentual: 0 },
      { estrelas: 3, percentual: 0 },
      { estrelas: 2, percentual: 0 },
      { estrelas: 1, percentual: 0 },
    ];

    if (!jogo) {
      return { mediaReal: 0, totalReal: 0, distribuicao: distribuicaoVazia };
    }

    if (jogo.totalAvaliacoes > 0 && jogo.notaMedia > 0) {
      return {
        mediaReal: jogo.notaMedia,
        totalReal: jogo.totalAvaliacoes,
        distribuicao: distribuicaoRemota ?? obterDistribuicaoConhecidaJogo(jogo),
      };
    }

    if (typeof registroAtual?.nota === 'number' && registroAtual.nota > 0) {
      const faixaUsuario = Math.max(1, Math.min(5, Math.round(registroAtual.nota)));
      return {
        mediaReal: registroAtual.nota,
        totalReal: 1,
        distribuicao: ([5, 4, 3, 2, 1] as const).map((estrelas) => ({
          estrelas,
          percentual: estrelas === faixaUsuario ? 100 : 0,
        })),
      };
    }

    return { mediaReal: 0, totalReal: 0, distribuicao: distribuicaoVazia };
  }, [jogo, distribuicaoRemota, registroAtual?.nota]);

  const relacionados = useMemo(() => {
    if (!jogo) return [];
    if (relacionadosRemotos && relacionadosRemotos.length > 0) return relacionadosRemotos;
    return obterJogosRelacionados(jogo, 6);
  }, [jogo, relacionadosRemotos]);

  const reviewsDoJogo = useMemo(() => {
    if (!jogo) return [];
    const doUsuario = reviewsUsuario.filter((r) => r.jogoId === jogo.id);
    const baseComunidade =
      reviewsRemotas !== null
        ? reviewsRemotas
        : REVIEWS_INICIAIS_MOCK.filter((r) => r.jogoId === jogo.id);

    const idsRemotos = new Set(baseComunidade.map((r) => r.id));
    const todas = [
      ...doUsuario.filter((r) => !idsRemotos.has(r.id)),
      ...baseComunidade,
    ].filter((r) => !reviewsExcluidas[r.id]);

    if (ordenacao === 'curtidas') {
      return [...todas].sort((a, b) => {
        const curtidasA =
          (a.curtidaPeloUsuario ? Math.max(0, a.curtidas - 1) : a.curtidas) +
          ((reviewsCurtidas[a.id] ?? Boolean(a.curtidaPeloUsuario)) ? 1 : 0);
        const curtidasB =
          (b.curtidaPeloUsuario ? Math.max(0, b.curtidas - 1) : b.curtidas) +
          ((reviewsCurtidas[b.id] ?? Boolean(b.curtidaPeloUsuario)) ? 1 : 0);
        return curtidasB - curtidasA;
      });
    }
    if (ordenacao === 'nota') {
      return [...todas].sort((a, b) => b.nota - a.nota);
    }
    return todas;
  }, [jogo, reviewsUsuario, reviewsRemotas, ordenacao, reviewsCurtidas, reviewsExcluidas]);

  if (carregandoJogo) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
          Checkpoint · Sincronizando Fogueira
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Carregando detalhes do jogo...
        </h1>
      </section>
    );
  }

  if (!jogo) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
          Checkpoint · Jogo não encontrado
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Essa fogueira ainda não foi acesa
        </h1>
        <p className="text-sm sm:text-base text-night-300">
          Não encontramos o jogo solicitado no catálogo atual. Volte para a vitrine principal para
          explorar outros títulos.
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

  const jogado = Boolean(registroAtual?.jogado);
  const queroJogar = Boolean(registroAtual?.queroJogar);
  const favorito = Boolean(registroAtual?.favorito);

  const abrirAvaliacaoRelacionado = (item: JogoResumo) => {
    navegar(rotaAvaliarJogo(item.id));
  };

  return (
    <div className="pb-20">
      <section className="relative w-full overflow-hidden border-b border-night-800/80">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 75% 22%, ${jogo.corSecundaria} 0%, #0b1320 62%, #05080f 100%)`,
          }}
          aria-hidden="true"
        />
        {jogo.bannerUrl && (
          <img
            src={jogo.bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-lighten"
            aria-hidden="true"
          />
        )}
        <div
          className="pointer-events-none absolute -top-24 right-[14%] h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: jogo.corAcento }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-night-950/92 via-night-900/78 to-night-950/55"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-night-900 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10 pt-8 pb-12 sm:pt-10 sm:pb-16 space-y-8">
          <nav aria-label="Navegação de retorno">
            <Link
              to={ROTAS.INICIO}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-night-950/60 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-night-300 hover:text-white hover:border-fire-500/50 transition-colors"
            >
              <span aria-hidden="true">←</span>
              <span>Voltar para a Fogueira</span>
            </Link>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-8 items-start">
            <div className="space-y-3.5 max-w-[260px]">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.85)]">
                <CapaJogoEstilizada jogo={jogo} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => alternarJogado(jogo.id)}
                  aria-pressed={jogado}
                  className={cn(
                    'rounded-xl border py-2.5 px-2 text-xs font-semibold transition-colors cursor-pointer',
                    jogado
                      ? 'border-fire-400 bg-fire-500/20 text-ember-300'
                      : 'border-night-700 bg-night-900/80 text-night-300 hover:text-white hover:border-night-500'
                  )}
                >
                  {jogado ? '✓ Joguei' : 'Joguei'}
                </button>

                <button
                  type="button"
                  onClick={() => alternarQueroJogar(jogo.id)}
                  aria-pressed={queroJogar}
                  className={cn(
                    'rounded-xl border py-2.5 px-2 text-xs font-semibold transition-colors cursor-pointer',
                    queroJogar
                      ? 'border-ember-400/70 bg-ember-500/15 text-ember-300'
                      : 'border-night-700 bg-night-900/80 text-night-300 hover:text-white hover:border-night-500'
                  )}
                >
                  {queroJogar ? '✓ Lista' : '+ Lista'}
                </button>

                <button
                  type="button"
                  onClick={() => alternarFavorito(jogo.id)}
                  aria-pressed={favorito}
                  className={cn(
                    'rounded-xl border py-2.5 px-2 text-xs font-semibold transition-colors cursor-pointer',
                    favorito
                      ? 'border-rose-500/70 bg-rose-500/15 text-rose-300'
                      : 'border-night-700 bg-night-900/80 text-night-300 hover:text-white hover:border-night-500'
                  )}
                >
                  {favorito ? 'Favorito' : 'Favoritar'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {jogo.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-fire-500/40 bg-fire-500/15 px-3 py-1 text-ember-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-fire-400 animate-pulse" />
                    {jogo.badge}
                  </span>
                )}
                <span className="rounded-full border border-white/10 bg-night-950/70 px-3 py-1 text-night-200">
                  {jogo.ano}
                </span>
                <span className="text-night-300">{jogo.desenvolvedora}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
                {jogo.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                {jogo.generos.map((genero) => (
                  <span
                    key={genero}
                    className="rounded-lg border border-night-700/80 bg-night-800/80 px-2.5 py-1 text-xs font-medium text-night-200"
                  >
                    {genero}
                  </span>
                ))}
              </div>

              <p className="text-sm sm:text-base text-night-300 leading-relaxed max-w-2xl">
                {jogo.sinopseCurta}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to={rotaAvaliarJogo(jogo.id)}>
                  <Botao variante="primario" tamanho="medio">
                    {registroAtual ? 'Editar minha avaliação' : 'Avaliar / Escrever review'}
                  </Botao>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
                <div className="rounded-xl border border-night-800 bg-night-950/60 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-night-400 font-semibold">
                    Estúdio
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-white mt-1">
                    {jogo.desenvolvedora}
                  </p>
                </div>
                <div className="rounded-xl border border-night-800 bg-night-950/60 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-night-400 font-semibold">
                    Registros
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-white mt-1">
                    {totalReal > 0
                      ? `${totalReal.toLocaleString('pt-BR')} ${totalReal === 1 ? 'jogador' : 'jogadores'}`
                      : 'Ainda não avaliado'}
                  </p>
                </div>
              </div>
            </div>

            <aside
              aria-label="Distribuição de notas da comunidade"
              className="rounded-2xl border border-night-700/80 bg-night-950/75 backdrop-blur-md p-5 space-y-4 shadow-xl shadow-black/30 md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-night-400">
                    Nota da Fogueira
                  </p>
                  {mediaReal > 0 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-3xl font-black text-ember-400">
                        <IconeChamaNota tamanho={26} />
                        <span>{mediaReal.toFixed(1)}</span>
                      </span>
                      <span className="text-xs text-night-400">/ 5.0</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full border border-night-700 bg-night-800/80 px-2.5 py-1 text-[11px] font-semibold text-night-300">
                        Ainda não avaliado
                      </span>
                    </div>
                  )}
                </div>
                {registroAtual?.nota && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-fire-400 font-semibold">
                      Sua nota
                    </p>
                    <p className="inline-flex items-center gap-1 text-lg font-extrabold text-white">
                      <IconeChamaNota tamanho={16} />
                      <span>{registroAtual.nota.toFixed(1)}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {distribuicao.map((faixa) => (
                  <div key={faixa.estrelas} className="flex items-center gap-2.5 text-xs">
                    <span className="w-8 inline-flex items-center justify-end gap-0.5 font-semibold text-night-300">
                      <span>{faixa.estrelas}</span>
                      <IconeChamaNota tamanho={11} />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-night-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-fire-600 to-ember-400 transition-all duration-500"
                        style={{ width: `${faixa.percentual}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[11px] text-night-400 tabular-nums">
                      {faixa.percentual}%
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
        <section aria-labelledby="titulo-reviews-jogo" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-reviews-jogo" className="text-xl sm:text-2xl font-bold text-white">
                Reviews da Comunidade
              </h2>
              <p className="text-xs sm:text-sm text-night-400">
                {reviewsDoJogo.length}{' '}
                {reviewsDoJogo.length === 1 ? 'review registrada' : 'reviews registradas'} sobre{' '}
                {jogo.titulo}
              </p>
            </div>

            <div
              className="flex items-center gap-1 rounded-xl border border-night-800 bg-night-950/70 p-1"
              role="tablist"
              aria-label="Ordenar reviews"
            >
              {(
                [
                  { id: 'recentes', label: 'Recentes' },
                  { id: 'curtidas', label: 'Mais curtidas' },
                  { id: 'nota', label: 'Maior nota' },
                ] as const
              ).map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  aria-selected={ordenacao === aba.id}
                  onClick={() => setOrdenacao(aba.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                    ordenacao === aba.id
                      ? 'bg-fire-500/20 text-ember-300 border border-fire-500/40'
                      : 'text-night-400 hover:text-white'
                  )}
                >
                  {aba.label}
                </button>
              ))}
            </div>
          </div>

          {reviewsDoJogo.length > 0 ? (
            <div className="space-y-4">
              {reviewsDoJogo.map((review) => (
                <CardReviewComunidade
                  key={review.id}
                  review={review}
                  curtida={reviewsCurtidas[review.id] ?? Boolean(review.curtidaPeloUsuario)}
                  aoAlternarCurtida={alternarCurtidaReview}
                  aoExcluir={excluirReview}
                  ocultarCapa
                  larguraCompleta
                  totalComentarios={contarComentarios(review)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-night-700 bg-night-800/35 p-8 text-center space-y-3">
              <p className="text-base font-bold text-white">
                Seja a primeira pessoa a avaliar {jogo.titulo}
              </p>
              <p className="text-xs sm:text-sm text-night-400 max-w-md mx-auto">
                Abra a página de avaliação para registrar sua nota e contar para a comunidade o que
                você achou.
              </p>
              <div className="pt-1">
                <Link to={rotaAvaliarJogo(jogo.id)}>
                  <Botao variante="primario" tamanho="pequeno">
                    Avaliar agora
                  </Botao>
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside
          aria-labelledby="titulo-seu-registro"
          className="lg:sticky lg:top-24 rounded-2xl border border-night-700/90 bg-night-800/75 backdrop-blur-md p-6 shadow-2xl shadow-black/40 space-y-5"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fire-400">
              Seu Registro
            </p>
            <h2 id="titulo-seu-registro" className="text-lg font-extrabold text-white mt-0.5">
              {registroAtual ? 'Sua avaliação na Fogueira' : `Avalie ${jogo.titulo}`}
            </h2>
          </div>

          {registroAtual ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {registroAtual.status && (
                  <span className="rounded-lg border border-fire-500/40 bg-fire-500/15 px-2.5 py-1 text-xs font-semibold text-ember-300">
                    {LABELS_STATUS[registroAtual.status]}
                  </span>
                )}
                {typeof registroAtual.nota === 'number' && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-ember-400/30 bg-night-950/80 px-2.5 py-1 text-xs font-bold text-ember-400">
                    <IconeChamaNota tamanho={13} />
                    <span>
                      {registroAtual.nota.toFixed(1)} · {obterDescricaoNota(registroAtual.nota)}
                    </span>
                  </span>
                )}
                {registroAtual.favorito && (
                  <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300">
                    Favorito
                  </span>
                )}
              </div>

              {registroAtual.tags && registroAtual.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {registroAtual.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-night-700 bg-night-900/80 px-2.5 py-0.5 text-[11px] text-night-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {registroAtual.comentario && (
                <p className="text-xs text-night-300 leading-relaxed line-clamp-4">
                  &ldquo;{registroAtual.comentario}&rdquo;
                </p>
              )}

              <Link to={rotaAvaliarJogo(jogo.id)} className="block">
                <Botao variante="primario" tamanho="medio" className="w-full">
                  Editar avaliação
                </Botao>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-night-300 leading-relaxed">
                Registre seu status, escolha sua nota com precisão de meia estrela e publique sua
                review na página dedicada de avaliação.
              </p>
              <Link to={rotaAvaliarJogo(jogo.id)} className="block">
                <Botao variante="primario" tamanho="medio" className="w-full">
                  Abrir página de avaliação
                </Botao>
              </Link>
            </div>
          )}
        </aside>
      </div>

      {relacionados.length > 0 && (
        <div className="pt-14">
          <FileiraCarrossel
            id="jogos-relacionados"
            titulo="Jogos Relacionados"
            subtitulo={`Se você curtiu ${jogo.titulo}, vale acender a fogueira nestes também`}
          >
            {relacionados.map((item) => {
              const reg = registros[item.id];
              return (
                <CardJogo
                  key={item.id}
                  jogo={item}
                  jogado={Boolean(reg?.jogado)}
                  queroJogar={Boolean(reg?.queroJogar)}
                  favorito={Boolean(reg?.favorito)}
                  notaUsuario={reg?.nota}
                  aoAlternarJogado={alternarJogado}
                  aoAlternarQueroJogar={alternarQueroJogar}
                  aoAbrirAvaliacao={abrirAvaliacaoRelacionado}
                />
              );
            })}
          </FileiraCarrossel>
        </div>
      )}
    </div>
  );
};
