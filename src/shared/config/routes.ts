export const ROTAS = {
  INICIO: '/',
  LOGIN: '/login',
  CADASTRO: '/cadastro',
  PERFIL: '/perfil',
} as const;

export const ROUTES = {
  HOME: ROTAS.INICIO,
  LOGIN: ROTAS.LOGIN,
  REGISTER: ROTAS.CADASTRO,
  PROFILE: ROTAS.PERFIL,
} as const;
