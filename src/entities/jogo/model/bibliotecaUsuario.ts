import { useCallback, useEffect, useState } from 'react';
import { diarioApi, estantesApi, postsApi } from '@shared/api';
import {
  EVENTO_MUDANCA_AUTENTICACAO,
  decodificarPayloadToken,
  possuiToken,
} from '@shared/lib';
import {
  adaptarComentarioBackend,
  adaptarPostBackend,
  adaptarRegistroDiarioBackend,
  atualizarMetricasJogoNoCache,
  registrarJogoNoCache,
  resetarCacheCatalogoDinamico,
  resolverSteamAppIdDeJogoId,
} from './adaptadoresApi';
import type {
  ComentarioReview,
  JogoResumo,
  RegistroJogoUsuario,
  ReviewComunidade,
  StatusBiblioteca,
} from './tipos';

const CHAVE_REGISTROS = 'checkpoint_biblioteca_registros_v1';
const CHAVE_REVIEWS = 'checkpoint_biblioteca_reviews_v1';
const CHAVE_CURTIDAS = 'checkpoint_biblioteca_curtidas_v1';
const CHAVE_COMENTARIOS = 'checkpoint_biblioteca_comentarios_v1';
const EVENTO_ATUALIZACAO_BIBLIOTECA = 'checkpoint:biblioteca-atualizada';

export interface EstadoBiblioteca {
  registros: Record<string, RegistroJogoUsuario>;
  reviewsUsuario: ReviewComunidade[];
  reviewsCurtidas: Record<string, boolean>;
  comentariosUsuario: ComentarioReview[];
  reviewsExcluidas: Record<string, boolean>;
}

const ESTADO_VAZIO: EstadoBiblioteca = {
  registros: {},
  reviewsUsuario: [],
  reviewsCurtidas: {},
  comentariosUsuario: [],
  reviewsExcluidas: {},
};

const lerJsonSeguro = <T,>(chave: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return fallback;
    return JSON.parse(bruto) as T;
  } catch {
    return fallback;
  }
};

const salvarJsonSeguro = (chave: string, valor: unknown): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Ignora falhas de quota ou ambiente sem localStorage
  }
};

const carregarDoStorage = (): EstadoBiblioteca => ({
  registros: lerJsonSeguro<Record<string, RegistroJogoUsuario>>(CHAVE_REGISTROS, {}),
  reviewsUsuario: lerJsonSeguro<ReviewComunidade[]>(CHAVE_REVIEWS, []),
  reviewsCurtidas: lerJsonSeguro<Record<string, boolean>>(CHAVE_CURTIDAS, {}),
  comentariosUsuario: lerJsonSeguro<ComentarioReview[]>(CHAVE_COMENTARIOS, []),
  reviewsExcluidas: {},
});

let estadoMemoria: EstadoBiblioteca = carregarDoStorage();
let tokenHidratadoAtual: string | null = null;

const notificarListeners = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_ATUALIZACAO_BIBLIOTECA));
  }
};

const persistirENotificar = (proximo: EstadoBiblioteca): void => {
  estadoMemoria = proximo;
  salvarJsonSeguro(CHAVE_REGISTROS, proximo.registros);
  salvarJsonSeguro(CHAVE_REVIEWS, proximo.reviewsUsuario);
  salvarJsonSeguro(CHAVE_CURTIDAS, proximo.reviewsCurtidas);
  salvarJsonSeguro(CHAVE_COMENTARIOS, proximo.comentariosUsuario);
  notificarListeners();
};

export const limparBibliotecaLocal = (): void => {
  tokenHidratadoAtual = null;
  resetarCacheCatalogoDinamico();
  estadoMemoria = {
    registros: {},
    reviewsUsuario: [],
    reviewsCurtidas: {},
    comentariosUsuario: [],
    reviewsExcluidas: {},
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CHAVE_REGISTROS);
      window.localStorage.removeItem(CHAVE_REVIEWS);
      window.localStorage.removeItem(CHAVE_CURTIDAS);
      window.localStorage.removeItem(CHAVE_COMENTARIOS);
    }
  } catch {
    // Ignora em ambientes sem storage
  }
  notificarListeners();
};

export interface DadosSalvarAvaliacao {
  jogo: JogoResumo;
  nota: number;
  status: StatusBiblioteca;
  comentario: string;
  tags?: string[];
  contemSpoiler?: boolean;
  favorito?: boolean;
}

const obterAutorAtual = () => {
  const payload = decodificarPayloadToken();
  const nomeBruto =
    payload?.unique_name?.trim() ||
    payload?.email?.split('@')[0]?.trim() ||
    'Viajante da Fogueira';
  const partes = nomeBruto.split(/\s+/).filter(Boolean);
  const iniciais =
    partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
      : nomeBruto.slice(0, 2).toUpperCase();
  const handle = `@${nomeBruto.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'fogueira'}`;

  return { nome: nomeBruto, handle, iniciais };
};

export const sincronizarBibliotecaComBackend = async (): Promise<void> => {
  if (!possuiToken()) {
    tokenHidratadoAtual = null;
    return;
  }

  try {
    const biblioteca = await diarioApi.obterMinhaBiblioteca();
    const registrosRemotos: Record<string, RegistroJogoUsuario> = {};

    for (const item of biblioteca.registros) {
      const adaptado = adaptarRegistroDiarioBackend(item);
      registrosRemotos[adaptado.jogoId] = adaptado.registro;
    }

    const reviewsRemotas = biblioteca.reviewsUsuario.map(adaptarPostBackend);
    const curtidasRemotas: Record<string, boolean> = { ...estadoMemoria.reviewsCurtidas };
    for (const rev of reviewsRemotas) {
      if (rev.curtidaPeloUsuario) {
        curtidasRemotas[rev.id] = true;
      }
    }

    const reviewsLocaisNaoSincronizadas = estadoMemoria.reviewsUsuario.filter(
      (local) => !local.idPostBackend && !estadoMemoria.reviewsExcluidas[local.id]
    );
    const idsRemotos = new Set(reviewsRemotas.map((r) => r.id));
    const reviewsMescladas = [
      ...reviewsRemotas.filter((r) => !estadoMemoria.reviewsExcluidas[r.id]),
      ...reviewsLocaisNaoSincronizadas.filter((r) => !idsRemotos.has(r.id)),
    ];

    persistirENotificar({
      ...estadoMemoria,
      registros: {
        ...estadoMemoria.registros,
        ...registrosRemotos,
      },
      reviewsUsuario: reviewsMescladas,
      reviewsCurtidas: curtidasRemotas,
    });
  } catch {
    // Mantém dados locais caso o backend esteja offline ou em ambiente de teste
  }
};

export const useBibliotecaFogueira = () => {
  const [estado, setEstado] = useState<EstadoBiblioteca>(() => estadoMemoria);

  useEffect(() => {
    const sincronizarMemoria = () => setEstado(estadoMemoria);
    const sincronizarOutraAba = () => {
      estadoMemoria = carregarDoStorage();
      setEstado(estadoMemoria);
    };
    const verificarAutenticacao = () => {
      const payload = decodificarPayloadToken();
      const sub = payload?.sub ?? null;
      if (possuiToken() && sub && tokenHidratadoAtual !== sub) {
        tokenHidratadoAtual = sub;
        void sincronizarBibliotecaComBackend();
      } else if (!possuiToken()) {
        tokenHidratadoAtual = null;
      }
    };

    verificarAutenticacao();

    window.addEventListener(EVENTO_ATUALIZACAO_BIBLIOTECA, sincronizarMemoria);
    window.addEventListener(EVENTO_MUDANCA_AUTENTICACAO, verificarAutenticacao);
    window.addEventListener('storage', sincronizarOutraAba);
    return () => {
      window.removeEventListener(EVENTO_ATUALIZACAO_BIBLIOTECA, sincronizarMemoria);
      window.removeEventListener(EVENTO_MUDANCA_AUTENTICACAO, verificarAutenticacao);
      window.removeEventListener('storage', sincronizarOutraAba);
    };
  }, []);

  const atualizarEstado = useCallback(
    (mutador: (atual: EstadoBiblioteca) => EstadoBiblioteca) => {
      const proximo = mutador(estadoMemoria);
      persistirENotificar(proximo);
      setEstado(proximo);
    },
    []
  );

  const alternarJogado = useCallback(
    (jogoId: string) => {
      atualizarEstado((atual) => {
        const reg = atual.registros[jogoId];
        const proximoJogado = !reg?.jogado;
        return {
          ...atual,
          registros: {
            ...atual.registros,
            [jogoId]: {
              ...reg,
              jogoId,
              jogado: proximoJogado,
              status: proximoJogado ? (reg?.status ?? 'zerado') : reg?.status,
              atualizadoEm: new Date().toISOString(),
            },
          },
        };
      });

      const steamAppId = resolverSteamAppIdDeJogoId(jogoId);
      if (possuiToken() && steamAppId) {
        void diarioApi
          .alternarJogado(steamAppId)
          .then((dto) => {
            const adaptado = adaptarRegistroDiarioBackend(dto);
            atualizarEstado((atual) => ({
              ...atual,
              registros: {
                ...atual.registros,
                [adaptado.jogoId]: adaptado.registro,
              },
            }));
          })
          .catch(() => {
            // Mantém estado otimista local se a rede falhar
          });
      }
    },
    [atualizarEstado]
  );

  const alternarQueroJogar = useCallback(
    (jogoId: string) => {
      const jaEstavaNaLista = Boolean(estadoMemoria.registros[jogoId]?.queroJogar);
      const proximoQuero = !jaEstavaNaLista;

      atualizarEstado((atual) => {
        const reg = atual.registros[jogoId];
        return {
          ...atual,
          registros: {
            ...atual.registros,
            [jogoId]: {
              ...reg,
              jogoId,
              queroJogar: proximoQuero,
              status: proximoQuero && !reg?.status ? 'quero_jogar' : reg?.status,
              atualizadoEm: new Date().toISOString(),
            },
          },
        };
      });

      const steamAppId = resolverSteamAppIdDeJogoId(jogoId);
      if (possuiToken() && steamAppId) {
        const acao = proximoQuero
          ? estantesApi.adicionarJogo('pretende-jogar', steamAppId)
          : estantesApi.removerJogo('pretende-jogar', steamAppId);
        void acao.catch(() => {
          // Ignora falha de rede preservando atualização otimista
        });
      }
    },
    [atualizarEstado]
  );

  const alternarFavorito = useCallback(
    (jogoId: string) => {
      const jaEraFavorito = Boolean(estadoMemoria.registros[jogoId]?.favorito);
      const proximoFavorito = !jaEraFavorito;

      atualizarEstado((atual) => {
        const reg = atual.registros[jogoId];
        return {
          ...atual,
          registros: {
            ...atual.registros,
            [jogoId]: {
              ...reg,
              jogoId,
              favorito: proximoFavorito,
              atualizadoEm: new Date().toISOString(),
            },
          },
        };
      });

      const steamAppId = resolverSteamAppIdDeJogoId(jogoId);
      if (possuiToken() && steamAppId) {
        const acao = proximoFavorito
          ? estantesApi.adicionarJogo('favoritos', steamAppId)
          : estantesApi.removerJogo('favoritos', steamAppId);
        void acao.catch(() => {
          // Ignora falha de rede preservando atualização otimista
        });
      }
    },
    [atualizarEstado]
  );

  const alternarCurtidaReview = useCallback(
    (reviewId: string) => {
      atualizarEstado((atual) => ({
        ...atual,
        reviewsCurtidas: {
          ...atual.reviewsCurtidas,
          [reviewId]: !atual.reviewsCurtidas[reviewId],
        },
      }));

      if (possuiToken() && /^\d+$/.test(reviewId)) {
        void postsApi
          .alternarCurtidaPost(Number(reviewId))
          .then((res) => {
            atualizarEstado((atual) => ({
              ...atual,
              reviewsCurtidas: {
                ...atual.reviewsCurtidas,
                [reviewId]: res.curtido,
              },
            }));
          })
          .catch(() => {
            // Mantém estado otimista
          });
      }
    },
    [atualizarEstado]
  );

  const salvarAvaliacao = useCallback(
    ({
      jogo,
      nota,
      status,
      comentario,
      tags,
      contemSpoiler,
      favorito,
    }: DadosSalvarAvaliacao) => {
      registrarJogoNoCache(jogo);
      const textoLimpo = comentario.trim();
      const agora = new Date().toISOString();
      const idTemporarioReview = `rev-user-${jogo.id}`;

      atualizarEstado((atual) => {
        const regAnterior = atual.registros[jogo.id];
        const novoRegistro: RegistroJogoUsuario = {
          ...regAnterior,
          jogoId: jogo.id,
          steamAppId: jogo.steamAppId ?? resolverSteamAppIdDeJogoId(jogo.id) ?? undefined,
          nota,
          status,
          jogado: status === 'zerado' || status === 'jogando' ? true : regAnterior?.jogado,
          queroJogar: status === 'quero_jogar' ? true : regAnterior?.queroJogar,
          favorito: typeof favorito === 'boolean' ? favorito : regAnterior?.favorito,
          tags: tags ?? regAnterior?.tags,
          comentario: textoLimpo || regAnterior?.comentario,
          contemSpoiler: Boolean(contemSpoiler),
          atualizadoEm: agora,
        };

        let proximasReviews = atual.reviewsUsuario;
        if (textoLimpo) {
          const autor = obterAutorAtual();
          const novaReview: ReviewComunidade = {
            id: regAnterior?.idPostReview ? String(regAnterior.idPostReview) : idTemporarioReview,
            idPostBackend: regAnterior?.idPostReview,
            autorNome: autor.nome,
            autorHandle: autor.handle,
            autorIniciais: autor.iniciais,
            jogoId: jogo.id,
            steamAppId: novoRegistro.steamAppId,
            jogoTitulo: jogo.titulo,
            jogoAno: jogo.ano,
            jogoCorPrimaria: jogo.corPrimaria,
            jogoCorSecundaria: jogo.corSecundaria,
            jogoCorAcento: jogo.corAcento,
            jogoCapaUrl: jogo.capaUrl,
            nota,
            comentario: textoLimpo,
            curtidas: 0,
            tempoAtras: 'agora mesmo',
            status,
            tags: tags && tags.length > 0 ? tags : undefined,
            contemSpoiler: Boolean(contemSpoiler),
            doUsuarioAtual: true,
          };

          proximasReviews = [
            novaReview,
            ...atual.reviewsUsuario.filter(
              (r) => r.jogoId !== jogo.id && r.id !== novaReview.id
            ),
          ];
        }

        const proximasExcluidas = { ...atual.reviewsExcluidas };
        delete proximasExcluidas[idTemporarioReview];
        if (regAnterior?.idPostReview) {
          delete proximasExcluidas[String(regAnterior.idPostReview)];
        }

        return {
          ...atual,
          registros: {
            ...atual.registros,
            [jogo.id]: novoRegistro,
          },
          reviewsUsuario: proximasReviews,
          reviewsExcluidas: proximasExcluidas,
        };
      });

      const steamAppId = jogo.steamAppId ?? resolverSteamAppIdDeJogoId(jogo.id);
      if (possuiToken() && steamAppId) {
        void diarioApi
          .salvarAvaliacaoJogo(steamAppId, {
            nota,
            status,
            comentario: textoLimpo || undefined,
            tags,
            contemSpoiler: Boolean(contemSpoiler),
            favorito,
          })
          .then((resposta) => {
            const adaptadoReg = adaptarRegistroDiarioBackend(resposta.registro);
            atualizarMetricasJogoNoCache(
              steamAppId,
              resposta.mediaFogueirasJogo,
              resposta.totalAvaliacoesJogo,
              resposta.distribuicaoFogueiras
            );

            atualizarEstado((atual) => {
              let reviewsAtualizadas = atual.reviewsUsuario;
              const proximasExcluidas = { ...atual.reviewsExcluidas };
              if (resposta.reviewPublicada) {
                const reviewReal = adaptarPostBackend(resposta.reviewPublicada);
                delete proximasExcluidas[reviewReal.id];
                reviewsAtualizadas = [
                  reviewReal,
                  ...atual.reviewsUsuario.filter(
                    (r) =>
                      r.id !== idTemporarioReview &&
                      r.id !== reviewReal.id &&
                      r.jogoId !== adaptadoReg.jogoId
                  ),
                ];
              }

              return {
                ...atual,
                registros: {
                  ...atual.registros,
                  [adaptadoReg.jogoId]: adaptadoReg.registro,
                },
                reviewsUsuario: reviewsAtualizadas,
                reviewsExcluidas: proximasExcluidas,
              };
            });
          })
          .catch(() => {
            // Mantém estado otimista local caso o backend esteja indisponível
          });
      }
    },
    [atualizarEstado]
  );

  const excluirReview = useCallback(
    async (review: Pick<ReviewComunidade, 'id' | 'idPostBackend' | 'jogoId'>): Promise<void> => {
      const estadoAnterior = estadoMemoria;
      const idLimpo = review.id.trim();
      const idPostNumerico =
        review.idPostBackend ?? (/^\d+$/.test(idLimpo) ? Number(idLimpo) : null);
      const idTempJogo = `rev-user-${review.jogoId}`;

      atualizarEstado((atual) => {
        const proximasExcluidas: Record<string, boolean> = {
          ...atual.reviewsExcluidas,
          [review.id]: true,
        };
        if (idPostNumerico !== null) {
          proximasExcluidas[String(idPostNumerico)] = true;
        }

        const proximasCurtidas = { ...atual.reviewsCurtidas };
        delete proximasCurtidas[review.id];
        if (idPostNumerico !== null) {
          delete proximasCurtidas[String(idPostNumerico)];
        }

        const proximosRegistros = { ...atual.registros };
        const regJogo = proximosRegistros[review.jogoId];
        if (
          regJogo &&
          (!regJogo.idPostReview ||
            idPostNumerico === null ||
            regJogo.idPostReview === idPostNumerico)
        ) {
          proximosRegistros[review.jogoId] = {
            ...regJogo,
            idPostReview: undefined,
            comentario: undefined,
            contemSpoiler: undefined,
            atualizadoEm: new Date().toISOString(),
          };
        }

        return {
          ...atual,
          registros: proximosRegistros,
          reviewsUsuario: atual.reviewsUsuario.filter(
            (r) =>
              r.id !== review.id &&
              r.id !== idTempJogo &&
              (idPostNumerico === null ||
                (r.idPostBackend !== idPostNumerico && r.id !== String(idPostNumerico)))
          ),
          reviewsCurtidas: proximasCurtidas,
          comentariosUsuario: atual.comentariosUsuario.filter(
            (c) =>
              c.reviewId !== review.id &&
              (idPostNumerico === null || c.reviewId !== String(idPostNumerico))
          ),
          reviewsExcluidas: proximasExcluidas,
        };
      });

      if (possuiToken() && idPostNumerico !== null) {
        try {
          await postsApi.excluirPost(idPostNumerico);
        } catch (erro) {
          const codigoStatus = (erro as { codigoStatus?: number })?.codigoStatus;
          if (codigoStatus === 401 || codigoStatus === 403) {
            persistirENotificar(estadoAnterior);
            setEstado(estadoAnterior);
            throw erro;
          }
          // Se offline ou já excluído (404), mantém a exclusão otimista local
        }
      }
    },
    [atualizarEstado]
  );

  const adicionarComentarioReview = useCallback(
    (reviewId: string, texto: string, contemSpoiler = false) => {
      const limpo = texto.trim();
      if (!limpo) return;
      const autor = obterAutorAtual();
      const idTemp = `com-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const novo: ComentarioReview = {
        id: idTemp,
        reviewId,
        autorNome: autor.nome,
        autorHandle: autor.handle,
        autorIniciais: autor.iniciais,
        texto: limpo,
        tempoAtras: 'agora mesmo',
        contemSpoiler,
        doUsuarioAtual: true,
      };
      atualizarEstado((atual) => ({
        ...atual,
        comentariosUsuario: [novo, ...atual.comentariosUsuario],
      }));

      if (possuiToken() && /^\d+$/.test(reviewId)) {
        void postsApi
          .adicionarComentario(Number(reviewId), limpo, contemSpoiler)
          .then((comentarioCriado) => {
            const real = adaptarComentarioBackend(comentarioCriado);
            atualizarEstado((atual) => ({
              ...atual,
              comentariosUsuario: [
                real,
                ...atual.comentariosUsuario.filter(
                  (c) => c.id !== idTemp && c.id !== real.id
                ),
              ],
            }));
          })
          .catch(() => {
            // Mantém comentário otimista local
          });
      }
    },
    [atualizarEstado]
  );

  return {
    registros: estado.registros,
    reviewsUsuario: estado.reviewsUsuario,
    reviewsCurtidas: estado.reviewsCurtidas,
    comentariosUsuario: estado.comentariosUsuario,
    reviewsExcluidas: estado.reviewsExcluidas,
    alternarJogado,
    alternarQueroJogar,
    alternarFavorito,
    alternarCurtidaReview,
    salvarAvaliacao,
    excluirReview,
    adicionarComentarioReview,
  };
};

export { ESTADO_VAZIO };
