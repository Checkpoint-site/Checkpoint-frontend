/**
 * Mapeamento centralizado dos Endpoints do Checkpoint-backend (.NET 10)
 * Baseado em Api/Program.cs -> app.MapGroup("/api/v1")
 */
export const ENDPOINTS_API = {
  AUTENTICACAO: {
    LOGIN: '/login',
    CADASTRO: '/cadastro',
    VERIFICAR_DISPONIBILIDADE: '/cadastro/verificar-disponibilidade',
    SOLICITAR_CODIGO: '/cadastro/solicitar-codigo',
  },
  VITRINE: {
    HOME: '/vitrine/home',
    /** Endpoint de fallback quando ainda não existem jogos salvos no banco */
    FALLBACK: '/vitrine/fallback',
  },
  CATALOGO: {
    BUSCA: '/jogos/busca',
    DESTAQUES: '/jogos/destaques',
    TENDENCIAS_GENEROS: '/jogos/tendencias/generos',
    USUARIOS_POPULARES: '/jogos/comunidade/usuarios-populares',
    DETALHES: (steamAppId: number) => `/jogos/${steamAppId}`,
  },
  POSTS: {
    RECENTES: '/posts',
    DETALHES: (idPost: number) => `/posts/${idPost}`,
    POR_JOGO: (steamAppId: number) => `/posts/jogo/${steamAppId}`,
    EXCLUIR: (idPost: number) => `/posts/${idPost}`,
    CURTIR: (idPost: number) => `/posts/${idPost}/curtir`,
    COMENTARIOS: (idPost: number) => `/posts/${idPost}/comentarios`,
    CURTIR_COMENTARIO: (idComentario: number) =>
      `/posts/comentarios/${idComentario}/curtir`,
  },
  DIARIO: {
    ME: '/diario/me',
    AVALIAR_JOGO: (steamAppId: number) => `/diario/jogos/${steamAppId}/avaliacao`,
    ALTERNAR_JOGADO: (steamAppId: number) => `/diario/jogos/${steamAppId}/jogado`,
  },
  ESTANTES: {
    ME: '/estantes/me',
    MINHAS: '/estantes/me',
    PROMOCOES_PRETENDE_JOGAR: '/estantes/pretende-jogar/promocoes',
    ALTERAR_JOGO: (tipo: string, steamAppId: number) => `/estantes/${tipo}/jogos/${steamAppId}`,
    CONFIG_FAVORITOS: '/estantes/favoritos/configuracoes',
    CONFIG_PRETENDE_JOGAR: '/estantes/pretende-jogar/configuracoes',
  },
} as const;
