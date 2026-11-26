/**
 * Mapeamento centralizado dos Endpoints do Checkpoint-backend (.NET 10)
 */
export const ENDPOINTS_API = {
  AUTENTICACAO: {
    LOGIN: '/login',
    CADASTRO: '/cadastro',
    VERIFICAR_DISPONIBILIDADE: '/cadastro/verificar-disponibilidade',
    SOLICITAR_CODIGO: '/cadastro/solicitar-codigo',
  },
  ESTANTES: {
    MINHAS: '/estantes/me',
    PROMOCOES_PRETENDE_JOGAR: '/estantes/pretende-jogar/promocoes',
    ALTERAR_JOGO: (tipo: string, steamAppId: number) => `/estantes/${tipo}/jogos/${steamAppId}`,
    CONFIG_FAVORITOS: '/estantes/favoritos/configuracoes',
    CONFIG_PRETENDE_JOGAR: '/estantes/pretende-jogar/configuracoes',
  },
  CATALOGO: {
    DESTAQUES: '/catalogo/destaques',
    BUSCA: '/catalogo/busca',
    DETALHES: (id: number) => `/catalogo/jogos/${id}`,
    USUARIOS_POPULARES: '/catalogo/usuarios-populares',
  },
} as const;
