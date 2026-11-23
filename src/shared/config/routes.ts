export const ROTAS = {
  INICIO: '/',
  LOGIN: '/login',
  CADASTRO: '/cadastro',
} as const;

export const ROUTES = {
  HOME: ROTAS.INICIO,
  LOGIN: ROTAS.LOGIN,
  REGISTER: ROTAS.CADASTRO,
} as const;
