export const CHAVE_ARMAZENAMENTO_TOKEN = '@checkpoint:token_autenticacao';
export const EVENTO_MUDANCA_AUTENTICACAO = 'checkpoint:mudanca-autenticacao';

export interface PayloadJwt {
  sub?: string;
  email?: string;
  nameid?: string;
  unique_name?: string;
  exp?: number;
  iat?: number;
  [chave: string]: unknown;
}

const memoriaFallback = new Map<string, string>();

function obterRepositorio(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  if (
    typeof window !== 'undefined' &&
    window.localStorage &&
    typeof window.localStorage.getItem === 'function'
  ) {
    return window.localStorage;
  }

  return {
    getItem: (chave: string) => memoriaFallback.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      memoriaFallback.set(chave, valor);
    },
    removeItem: (chave: string) => {
      memoriaFallback.delete(chave);
    },
  };
}

function notificarMudancaAutenticacao(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(EVENTO_MUDANCA_AUTENTICACAO));
  }
}

/**
 * Armazena o token JWT no localStorage (com fallback seguro em memória) e notifica a aplicação.
 */
export function salvarToken(token: string): void {
  const tokenLimpo = token.trim();
  if (!tokenLimpo) return;
  obterRepositorio().setItem(CHAVE_ARMAZENAMENTO_TOKEN, tokenLimpo);
  notificarMudancaAutenticacao();
}

/**
 * Recupera o token JWT armazenado.
 */
export function obterToken(): string | null {
  return obterRepositorio().getItem(CHAVE_ARMAZENAMENTO_TOKEN);
}

/**
 * Remove o token JWT armazenado (sair da conta) e notifica a aplicação.
 */
export function removerToken(): void {
  obterRepositorio().removeItem(CHAVE_ARMAZENAMENTO_TOKEN);
  notificarMudancaAutenticacao();
}

/**
 * Verifica se existe um token JWT armazenado.
 */
export function possuiToken(): boolean {
  const token = obterToken();
  return Boolean(token && token.trim().length > 0);
}

/**
 * Decodifica o payload de um token JWT sem bibliotecas externas.
 */
export function decodificarPayloadToken<T = PayloadJwt>(
  token: string | null = obterToken()
): T | null {
  if (!token) return null;

  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const base64Url = partes[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const preenchido = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    const payloadJson = decodeURIComponent(
      atob(preenchido)
        .split('')
        .map((caractere) => '%' + ('00' + caractere.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(payloadJson) as T;
  } catch {
    return null;
  }
}

export const armazenamentoToken = {
  salvarToken,
  obterToken,
  removerToken,
  possuiToken,
  decodificarPayloadToken,
} as const;
