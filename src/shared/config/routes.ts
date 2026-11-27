export const ROTAS = {
  INICIO: '/',
  LOGIN: '/login',
  CADASTRO: '/cadastro',
  JOGO: '/jogo/:id',
  AVALIAR_JOGO: '/jogo/:id/avaliar',
  REVIEW: '/review/:id',
} as const;

export const rotaJogo = (id: string) => `/jogo/${encodeURIComponent(id)}`;
export const rotaAvaliarJogo = (id: string) => `/jogo/${encodeURIComponent(id)}/avaliar`;
export const rotaReview = (id: string) => `/review/${encodeURIComponent(id)}`;

export const ROUTES = {
  HOME: ROTAS.INICIO,
  LOGIN: ROTAS.LOGIN,
  REGISTER: ROTAS.CADASTRO,
  GAME: ROTAS.JOGO,
  RATE_GAME: ROTAS.AVALIAR_JOGO,
  REVIEW: ROTAS.REVIEW,
} as const;
