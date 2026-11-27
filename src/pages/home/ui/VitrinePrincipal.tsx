import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  COMENTARIOS_INICIAIS_MOCK,
  EVENTO_CATALOGO_ATUALIZADO,
  GENEROS_DISPONIVEIS,
  VITRINE_HOME_MOCK,
  adaptarJogoResumoBackend,
  adaptarVitrineHomeBackend,
  listarTodosJogosConhecidos,
  useBibliotecaFogueira,
  type JogoResumo,
  type RespostaVitrineHome,
  type ReviewComunidade,
} from '@entities/index';
import { catalogoApi, vitrineApi } from '@shared/api';
import { rotaAvaliarJogo } from '@shared/config';
import {
  BarraGeneros,
  CardJogo,
  CardReviewComunidade,
  FileiraCarrossel,
  HeroDestaque,
} from '@widgets/index';

export const VitrinePrincipal: React.FC = () => {
  const navegar = useNavigate();
  const [vitrine, setVitrine] = useState<RespostaVitrineHome>(VITRINE_HOME_MOCK);
  const [carregandoVitrine, setCarregandoVitrine] = useState<boolean>(true);
  const [versaoCatalogo, setVersaoCatalogo] = useState(0);
  const [generoSelecionado, setGeneroSelecionado] = useState<string>('todos');

  const {
    registros,
    reviewsUsuario,
    reviewsCurtidas,
    comentariosUsuario,
    reviewsExcluidas,
    alternarJogado,
    alternarQueroJogar,
    alternarCurtidaReview,
    excluirReview,
  } = useBibliotecaFogueira();

  useEffect(() => {
    let ativo = true;

    const possuiJogosNaVitrine = (v: RespostaVitrineHome) =>
      v.destaques.length > 0 ||
      v.secoes.some((s) => s.tipo !== 'REVIEWS' && s.itens.length > 0);

    const carregarVitrine = async () => {
      try {
        const dados = await vitrineApi.obterHome();
        if (!ativo) return;
        const adaptada = adaptarVitrineHomeBackend(dados);
        if (possuiJogosNaVitrine(adaptada)) {
          setVitrine(adaptada);
          setCarregandoVitrine(false);
          return;
        }
      } catch {
        // Tenta API de fallback quando /vitrine/home não estiver disponível ou sem jogos
      }

      try {
        const dadosFallback = await vitrineApi.obterFallback();
        if (!ativo) return;
        const adaptadaFallback = adaptarVitrineHomeBackend(dadosFallback);
        if (possuiJogosNaVitrine(adaptadaFallback)) {
          setVitrine(adaptadaFallback);
          setCarregandoVitrine(false);
          return;
        }
      } catch {
        // Se /vitrine/fallback ainda não existir no backend, tenta /jogos/destaques da Steam
      }

      const montarVitrineComJogos = (
        jogos: JogoResumo[],
        tituloSecao: string,
        subtituloSecao: string
      ) => {
        setVitrine({
          destaques: jogos.slice(0, 3),
          generosDisponiveis: GENEROS_DISPONIVEIS,
          secoes: [
            {
              id: 'top-10-fogueira',
              titulo: tituloSecao,
              subtitulo: subtituloSecao,
              tipo: 'TOP_10',
              itens: jogos.slice(0, 10),
            },
            {
              id: 'reviews-comunidade',
              titulo: 'Na Fogueira Agora',
              subtitulo: 'Avaliações recentes da comunidade',
              tipo: 'REVIEWS',
              itens: [],
            },
          ],
        });
      };

      try {
        const destaquesBrutos = await catalogoApi.obterDestaques();
        if (!ativo) return;
        const listaBruta = Array.isArray(destaquesBrutos)
          ? destaquesBrutos
          : destaquesBrutos?.itens ?? destaquesBrutos?.jogos ?? [];
        const jogosDestaques = listaBruta.map(adaptarJogoResumoBackend);
        if (jogosDestaques.length > 0) {
          montarVitrineComJogos(
            jogosDestaques,
            'Destaques da Steam',
            'Jogos trazidos direto da Steam enquanto o catálogo cresce'
          );
          setCarregandoVitrine(false);
          return;
        }
      } catch {
        // Continua para descoberta aleatória via busca na Steam
      }

      try {
        const termosAleatorios = [
          'dark',
          'star',
          'knight',
          'ring',
          'shadow',
          'soul',
          'dragon',
          'world',
          'cyber',
          'dead',
          'hollow',
          'quest',
        ];
        const embaralhados = [...termosAleatorios].sort(() => Math.random() - 0.5).slice(0, 2);
        const respostas = await Promise.allSettled(
          embaralhados.map((termo) => catalogoApi.buscar(termo, 'nome'))
        );
        if (!ativo) return;

        const mapaUnicos = new Map<string, JogoResumo>();
        for (const res of respostas) {
          if (res.status === 'fulfilled' && Array.isArray(res.value.itens)) {
            for (const dto of res.value.itens) {
              const adaptado = adaptarJogoResumoBackend(dto);
              if (!mapaUnicos.has(adaptado.id)) {
                mapaUnicos.set(adaptado.id, adaptado);
              }
            }
          }
        }

        const jogosAleatorios = Array.from(mapaUnicos.values()).sort(() => Math.random() - 0.5);
        if (jogosAleatorios.length > 0) {
          montarVitrineComJogos(
            jogosAleatorios,
            'Descobertas Aleatórias da Steam',
            'Jogos reais trazidos da Steam enquanto o banco ainda está sendo populado'
          );
        }
      } catch {
        // Sem jogos em nenhuma API — exibe aviso limpo na tela
      } finally {
        if (ativo) setCarregandoVitrine(false);
      }
    };

    const aoAtualizarCatalogo = () => setVersaoCatalogo((v) => v + 1);
    window.addEventListener(EVENTO_CATALOGO_ATUALIZADO, aoAtualizarCatalogo);
    void carregarVitrine();

    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_CATALOGO_ATUALIZADO, aoAtualizarCatalogo);
    };
  }, []);

  const todosJogosConhecidos = useMemo(
    () => listarTodosJogosConhecidos(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versaoCatalogo, vitrine]
  );

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

  const abrirPaginaAvaliacao = (jogo: JogoResumo) => {
    navegar(rotaAvaliarJogo(jogo.id));
  };

  const naListaQueroJogar = useMemo(() => {
    const mapa: Record<string, boolean> = {};
    for (const [id, reg] of Object.entries(registros)) {
      if (reg.queroJogar) mapa[id] = true;
    }
    return mapa;
  }, [registros]);

  const notasUsuario = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const [id, reg] of Object.entries(registros)) {
      if (typeof reg.nota === 'number') mapa[id] = reg.nota;
    }
    return mapa;
  }, [registros]);

  const jogosDaEstante = useMemo(
    () =>
      todosJogosConhecidos.filter((jogo) => {
        const reg = registros[jogo.id];
        return Boolean(reg && (reg.jogado || reg.queroJogar || reg.nota || reg.favorito));
      }),
    [todosJogosConhecidos, registros]
  );

  const resumoEstante = useMemo(() => {
    let jogadosCount = 0;
    let queroJogarCount = 0;
    let favoritosCount = 0;
    for (const reg of Object.values(registros)) {
      if (reg.jogado) jogadosCount += 1;
      if (reg.queroJogar) queroJogarCount += 1;
      if (reg.favorito) favoritosCount += 1;
    }
    return {
      jogados: jogadosCount,
      queroJogar: queroJogarCount,
      favoritos: favoritosCount,
      reviews: reviewsUsuario.length,
    };
  }, [registros, reviewsUsuario.length]);

  const jogosFiltradosPorGenero = useMemo(() => {
    if (generoSelecionado === 'todos') return [];
    return todosJogosConhecidos.filter((jogo) =>
      jogo.generosSlugs.includes(generoSelecionado)
    );
  }, [todosJogosConhecidos, generoSelecionado]);

  const nomeGeneroAtivo = useMemo(
    () =>
      vitrine.generosDisponiveis.find((g) => g.slug === generoSelecionado)?.nome ??
      'Selecionado',
    [vitrine.generosDisponiveis, generoSelecionado]
  );

  return (
    <div className="pb-16">
      <HeroDestaque
        destaques={vitrine.destaques}
        naListaQueroJogar={naListaQueroJogar}
        notasUsuario={notasUsuario}
        aoAlternarQueroJogar={alternarQueroJogar}
        aoAbrirAvaliacao={abrirPaginaAvaliacao}
      />

      {!carregandoVitrine && vitrine.destaques.length === 0 && vitrine.secoes.length === 0 && (
        <section
          aria-label="Catálogo vazio"
          className="mx-auto max-w-3xl px-6 py-20 text-center space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
            Checkpoint · Fogueira
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ainda não existem jogos carregados na vitrine
          </h1>
          <p className="text-sm text-night-400 max-w-lg mx-auto">
            Use a barra de pesquisa no topo para buscar jogos diretamente na Steam ou conecte a API
            de catálogo.
          </p>
        </section>
      )}

      <div id="explorar-generos">
        <BarraGeneros
          generos={vitrine.generosDisponiveis}
          generoSelecionado={generoSelecionado}
          aoSelecionarGenero={setGeneroSelecionado}
        />
      </div>

      <div className="space-y-8 pt-4">
        {jogosDaEstante.length > 0 && (
          <div id="secao-minha-estante" className="space-y-2">
            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-fire-500/30 bg-fire-500/10 px-3 py-1 font-semibold text-ember-300">
                {resumoEstante.jogados} jogados
              </span>
              <span className="rounded-full border border-night-700 bg-night-800/80 px-3 py-1 font-semibold text-night-200">
                {resumoEstante.queroJogar} na lista
              </span>
              {resumoEstante.favoritos > 0 && (
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-semibold text-rose-300">
                  {resumoEstante.favoritos} favoritos
                </span>
              )}
              {resumoEstante.reviews > 0 && (
                <span className="rounded-full border border-ember-400/30 bg-ember-500/10 px-3 py-1 font-semibold text-ember-300">
                  {resumoEstante.reviews}{' '}
                  {resumoEstante.reviews === 1 ? 'review publicada' : 'reviews publicadas'}
                </span>
              )}
            </div>

            <FileiraCarrossel
              id="minha-estante"
              titulo="Sua Estante na Fogueira"
              subtitulo="Jogos que você marcou, favoritou ou avaliou — salvos automaticamente"
            >
              {jogosDaEstante.map((jogo) => {
                const reg = registros[jogo.id];
                return (
                  <CardJogo
                    key={jogo.id}
                    jogo={jogo}
                    jogado={Boolean(reg?.jogado)}
                    queroJogar={Boolean(reg?.queroJogar)}
                    favorito={Boolean(reg?.favorito)}
                    notaUsuario={reg?.nota}
                    aoAlternarJogado={alternarJogado}
                    aoAlternarQueroJogar={alternarQueroJogar}
                    aoAbrirAvaliacao={abrirPaginaAvaliacao}
                  />
                );
              })}
            </FileiraCarrossel>
          </div>
        )}

        {generoSelecionado !== 'todos' ? (
          <section
            aria-label={`Jogos do gênero ${nomeGeneroAtivo}`}
            className="mx-auto max-w-[1600px] px-6 sm:px-10 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {nomeGeneroAtivo}
                </h2>
                <p className="text-xs sm:text-sm text-night-400">
                  {jogosFiltradosPorGenero.length} jogos encontrados neste gênero
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGeneroSelecionado('todos')}
                className="rounded-full border border-night-700 bg-night-800 px-3.5 py-1.5 text-xs font-semibold text-night-300 hover:border-fire-500/60 hover:text-white transition-colors cursor-pointer"
              >
                Limpar filtro ✕
              </button>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-5">
              {jogosFiltradosPorGenero.map((jogo) => {
                const reg = registros[jogo.id];
                return (
                  <CardJogo
                    key={jogo.id}
                    jogo={jogo}
                    jogado={Boolean(reg?.jogado)}
                    queroJogar={Boolean(reg?.queroJogar)}
                    favorito={Boolean(reg?.favorito)}
                    notaUsuario={reg?.nota}
                    aoAlternarJogado={alternarJogado}
                    aoAlternarQueroJogar={alternarQueroJogar}
                    aoAbrirAvaliacao={abrirPaginaAvaliacao}
                  />
                );
              })}
            </div>
          </section>
        ) : (
          vitrine.secoes.map((secao) => {
            if (secao.tipo === 'REVIEWS') {
              const idsRemotos = new Set(secao.itens.map((r) => r.id));
              const reviewsCombinadas = [
                ...reviewsUsuario.filter((r) => !idsRemotos.has(r.id)),
                ...secao.itens,
              ].filter((r) => !reviewsExcluidas[r.id]);
              if (reviewsCombinadas.length === 0) {
                return (
                  <section
                    key={secao.id}
                    id={`secao-${secao.id}`}
                    className="mx-auto max-w-[1600px] px-6 sm:px-10 space-y-3"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                        {secao.titulo}
                      </h2>
                      {secao.subtitulo && (
                        <p className="text-xs sm:text-sm text-night-400 mt-0.5">
                          {secao.subtitulo}
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-dashed border-night-700 bg-night-800/35 p-6 text-center">
                      <p className="text-sm font-semibold text-night-200">
                        Ainda não existem avaliações na Fogueira
                      </p>
                      <p className="text-xs text-night-400 mt-1">
                        Escolha um jogo acima e seja a primeira pessoa a publicar uma avaliação.
                      </p>
                    </div>
                  </section>
                );
              }

              return (
                <div key={secao.id} id={`secao-${secao.id}`}>
                  <FileiraCarrossel
                    id={secao.id}
                    titulo={secao.titulo}
                    subtitulo={secao.subtitulo}
                  >
                    {reviewsCombinadas.map((review) => (
                      <CardReviewComunidade
                        key={review.id}
                        review={review}
                        curtida={
                          reviewsCurtidas[review.id] ?? Boolean(review.curtidaPeloUsuario)
                        }
                        aoAlternarCurtida={alternarCurtidaReview}
                        aoExcluir={excluirReview}
                        totalComentarios={contarComentarios(review)}
                      />
                    ))}
                  </FileiraCarrossel>
                </div>
              );
            }

            return (
              <div key={secao.id} id={`secao-${secao.id}`}>
                <FileiraCarrossel
                  id={secao.id}
                  titulo={secao.titulo}
                  subtitulo={secao.subtitulo}
                  acaoLabel={secao.filtroGenero ? 'Ver gênero' : undefined}
                  aoClicarAcao={
                    secao.filtroGenero
                      ? () => setGeneroSelecionado(secao.filtroGenero!)
                      : undefined
                  }
                >
                  {secao.itens.map((jogo, index) => {
                    const reg = registros[jogo.id];
                    return (
                      <CardJogo
                        key={jogo.id}
                        jogo={jogo}
                        posicaoRanking={secao.tipo === 'TOP_10' ? index + 1 : undefined}
                        jogado={Boolean(reg?.jogado)}
                        queroJogar={Boolean(reg?.queroJogar)}
                        favorito={Boolean(reg?.favorito)}
                        notaUsuario={reg?.nota}
                        aoAlternarJogado={alternarJogado}
                        aoAlternarQueroJogar={alternarQueroJogar}
                        aoAbrirAvaliacao={abrirPaginaAvaliacao}
                      />
                    );
                  })}
                </FileiraCarrossel>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
