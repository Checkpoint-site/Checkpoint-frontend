import { clienteApi } from './base';
import { ENDPOINTS_API } from './endpoints';

export interface JogoResumoBackendDto {
  idJogo: number;
  steamAppId: number;
  nome: string;
  descricao?: string;
  imagem: string;
  desenvolvedora: string;
  publicadora: string;
  anoLancamento?: number | null;
  notaMetacritic?: number | null;
  gratuito: boolean;
  emBreve: boolean;
  precoOriginalCentavos?: number | null;
  precoFinalCentavos?: number | null;
  percentualDesconto: number;
  pontuacaoCuradoria: number;
  mediaFogueiras: number;
  totalAvaliacoes: number;
  generos: string[];
}

export interface FaixaDistribuicaoFogueirasBackendDto {
  estrelas: number;
  quantidade: number;
  percentual: number;
}

export interface JogoMetricasLoggerBackendDto {
  quantidadeCurtida: number;
  presencaPost: number;
  presencaComentario: number;
  presencaFavoritos: number;
  presencaPretendeJogar: number;
  somaFogueiras: number;
  totalAvaliacoes: number;
  mediaFogueiras: number;
}

export interface JogoDetalhesBackendDto {
  idJogo: number;
  steamAppId: number;
  nome: string;
  descricao: string;
  imagem: string;
  desenvolvedora: string;
  publicadora: string;
  generos: string[];
  dataLancamentoTexto?: string | null;
  anoLancamento?: number | null;
  notaMetacritic?: number | null;
  totalRecomendacoes: number;
  gratuito: boolean;
  emBreve: boolean;
  precoOriginalCentavos?: number | null;
  precoFinalCentavos?: number | null;
  percentualDesconto: number;
  sincronizadoEm: string;
  mediaFogueiras: number;
  totalAvaliacoes: number;
  distribuicaoFogueiras: FaixaDistribuicaoFogueirasBackendDto[];
  jogosRelacionados: JogoResumoBackendDto[];
  engajamentoComunidade: JogoMetricasLoggerBackendDto;
}

export interface BuscaCatalogoBackendDto {
  tipoBusca: string;
  jogoBuscado: string;
  algoritmoAplicado: string;
  totalResultados: number;
  itens: JogoResumoBackendDto[];
}

export interface PostBackendDto {
  idPost: number;
  idUsuario: number;
  autorNome: string;
  autorHandle: string;
  autorIniciais: string;
  autorFotoPerfil?: string | null;
  idJogo: number;
  steamAppId: number;
  jogoTitulo: string;
  jogoAno: number;
  jogoCapaUrl: string;
  desenvolvedoraJogo: string;
  titulo: string;
  nota: number;
  comentario: string;
  status?: string | null;
  tags: string[];
  curtidas: number;
  totalComentarios: number;
  contemSpoiler: boolean;
  curtidaPeloUsuario: boolean;
  doUsuarioAtual: boolean;
  tempoAtras: string;
  dataCriacao: string;
}

export interface ComentarioBackendDto {
  idComentario: number;
  idPost: number;
  idUsuario: number;
  autorNome: string;
  autorHandle: string;
  autorIniciais: string;
  autorFotoPerfil?: string | null;
  texto: string;
  curtidas: number;
  contemSpoiler: boolean;
  curtidaPeloUsuario: boolean;
  doUsuarioAtual: boolean;
  tempoAtras: string;
  dataCriacao: string;
}

export interface PostComComentariosBackendDto {
  review: PostBackendDto;
  comentarios: ComentarioBackendDto[];
  outrasReviews: PostBackendDto[];
}

export interface CurtidaBackendDto {
  idAlvo: number;
  curtido: boolean;
  quantidadeCurtidas: number;
}

export interface RegistroJogoUsuarioBackendDto {
  idJogo: number;
  steamAppId: number;
  jogoTitulo: string;
  jogoCapaUrl: string;
  jogoAno: number;
  desenvolvedora: string;
  generos: string[];
  notaMediaJogo: number;
  totalAvaliacoesJogo: number;
  status?: string | null;
  jogado: boolean;
  queroJogar: boolean;
  favorito: boolean;
  nota?: number | null;
  tags: string[];
  idPostReview?: number | null;
  comentario?: string | null;
  contemSpoiler: boolean;
  atualizadoEm: string;
}

export interface BibliotecaUsuarioBackendDto {
  idUsuario: number;
  resumo: {
    jogados: number;
    queroJogar: number;
    favoritos: number;
    reviews: number;
    mediaFogueirasUsuario: number;
  };
  registros: RegistroJogoUsuarioBackendDto[];
  reviewsUsuario: PostBackendDto[];
}

export interface SalvarAvaliacaoJogoBackendRequest {
  nota: number;
  status?: string;
  comentario?: string;
  tags?: string[];
  contemSpoiler: boolean;
  favorito?: boolean;
}

export interface AvaliacaoSalvaBackendDto {
  registro: RegistroJogoUsuarioBackendDto;
  reviewPublicada?: PostBackendDto | null;
  mediaFogueirasJogo: number;
  totalAvaliacoesJogo: number;
  distribuicaoFogueiras: FaixaDistribuicaoFogueirasBackendDto[];
}

export interface GeneroVitrineBackendDto {
  slug: string;
  nome: string;
}

export interface SecaoVitrineBackendDto {
  id: string;
  titulo: string;
  subtitulo?: string | null;
  tipo: 'JOGOS' | 'TOP_10' | 'REVIEWS';
  filtroGenero?: string | null;
  jogos: JogoResumoBackendDto[];
  reviews: PostBackendDto[];
}

export interface VitrineHomeBackendDto {
  destaques: JogoResumoBackendDto[];
  generosDisponiveis: GeneroVitrineBackendDto[];
  secoes: SecaoVitrineBackendDto[];
}

export const vitrineApi = {
  obterHome(): Promise<VitrineHomeBackendDto> {
    return clienteApi<VitrineHomeBackendDto>(ENDPOINTS_API.VITRINE.HOME);
  },

  /**
   * API de fallback para quando o banco ainda não tem jogos cadastrados.
   */
  obterFallback(): Promise<VitrineHomeBackendDto> {
    return clienteApi<VitrineHomeBackendDto>(ENDPOINTS_API.VITRINE.FALLBACK);
  },
};

export const catalogoApi = {
  buscar(
    jogoBuscado: string,
    tipo: 'nome' | 'ano' | 'autor' = 'nome',
    algoritmo: 'popularidade' | 'tendencia' | 'custo-beneficio' = 'popularidade'
  ): Promise<BuscaCatalogoBackendDto> {
    const params = new URLSearchParams({
      jogoBuscado,
      tipo,
      algoritmo,
    });
    return clienteApi<BuscaCatalogoBackendDto>(
      `${ENDPOINTS_API.CATALOGO.BUSCA}?${params.toString()}`
    );
  },

  obterDetalhesPorSteamAppId(steamAppId: number): Promise<JogoDetalhesBackendDto> {
    return clienteApi<JogoDetalhesBackendDto>(
      ENDPOINTS_API.CATALOGO.DETALHES(steamAppId)
    );
  },

  obterDestaques(): Promise<
    JogoResumoBackendDto[] | { itens?: JogoResumoBackendDto[]; jogos?: JogoResumoBackendDto[] }
  > {
    return clienteApi<
      JogoResumoBackendDto[] | { itens?: JogoResumoBackendDto[]; jogos?: JogoResumoBackendDto[] }
    >(ENDPOINTS_API.CATALOGO.DESTAQUES);
  },
};

export const postsApi = {
  listarRecentes(limite = 20): Promise<PostBackendDto[]> {
    return clienteApi<PostBackendDto[]>(
      `${ENDPOINTS_API.POSTS.RECENTES}?limite=${limite}`
    );
  },

  listarPorJogo(
    steamAppId: number,
    ordenacao: 'recentes' | 'curtidas' | 'nota' = 'recentes'
  ): Promise<PostBackendDto[]> {
    return clienteApi<PostBackendDto[]>(
      `${ENDPOINTS_API.POSTS.POR_JOGO(steamAppId)}?ordenacao=${ordenacao}`
    );
  },

  obterComComentarios(idPost: number): Promise<PostComComentariosBackendDto> {
    return clienteApi<PostComComentariosBackendDto>(
      ENDPOINTS_API.POSTS.DETALHES(idPost)
    );
  },

  excluirPost(idPost: number): Promise<void> {
    return clienteApi<void>(ENDPOINTS_API.POSTS.EXCLUIR(idPost), {
      method: 'DELETE',
    });
  },

  alternarCurtidaPost(idPost: number): Promise<CurtidaBackendDto> {
    return clienteApi<CurtidaBackendDto>(ENDPOINTS_API.POSTS.CURTIR(idPost), {
      method: 'POST',
    });
  },

  adicionarComentario(
    idPost: number,
    texto: string,
    contemSpoiler = false
  ): Promise<ComentarioBackendDto> {
    return clienteApi<ComentarioBackendDto>(
      ENDPOINTS_API.POSTS.COMENTARIOS(idPost),
      {
        method: 'POST',
        body: JSON.stringify({ texto, contemSpoiler }),
      }
    );
  },

  alternarCurtidaComentario(idComentario: number): Promise<CurtidaBackendDto> {
    return clienteApi<CurtidaBackendDto>(
      ENDPOINTS_API.POSTS.CURTIR_COMENTARIO(idComentario),
      { method: 'POST' }
    );
  },
};

export const diarioApi = {
  obterMinhaBiblioteca(): Promise<BibliotecaUsuarioBackendDto> {
    return clienteApi<BibliotecaUsuarioBackendDto>(ENDPOINTS_API.DIARIO.ME);
  },

  salvarAvaliacaoJogo(
    steamAppId: number,
    dados: SalvarAvaliacaoJogoBackendRequest
  ): Promise<AvaliacaoSalvaBackendDto> {
    return clienteApi<AvaliacaoSalvaBackendDto>(
      ENDPOINTS_API.DIARIO.AVALIAR_JOGO(steamAppId),
      {
        method: 'PUT',
        body: JSON.stringify(dados),
      }
    );
  },

  alternarJogado(steamAppId: number): Promise<RegistroJogoUsuarioBackendDto> {
    return clienteApi<RegistroJogoUsuarioBackendDto>(
      ENDPOINTS_API.DIARIO.ALTERNAR_JOGADO(steamAppId),
      { method: 'POST' }
    );
  },
};

export const estantesApi = {
  adicionarJogo(
    tipoEstante: 'favoritos' | 'pretende-jogar',
    steamAppId: number
  ): Promise<unknown> {
    return clienteApi(ENDPOINTS_API.ESTANTES.ALTERAR_JOGO(tipoEstante, steamAppId), {
      method: 'POST',
    });
  },

  removerJogo(
    tipoEstante: 'favoritos' | 'pretende-jogar',
    steamAppId: number
  ): Promise<unknown> {
    return clienteApi(ENDPOINTS_API.ESTANTES.ALTERAR_JOGO(tipoEstante, steamAppId), {
      method: 'DELETE',
    });
  },
};
