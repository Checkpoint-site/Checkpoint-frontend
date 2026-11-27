import { obterToken } from '../lib/armazenamentoToken';

export const URL_BASE_API = import.meta.env.VITE_API_URL || '/api/v1';

export interface PayloadErroBackend {
  error?: string;
  erro?: string;
  mensagem?: string;
  message?: string;
  title?: string;
  statusCode?: number;
  status?: number;
  errors?: Record<string, string[]> | string[];
}

export class ErroApi extends Error {
  public readonly codigoStatus: number;
  public readonly erros?: Record<string, string[]> | string[];

  constructor(
    mensagem: string,
    codigoStatus: number,
    erros?: Record<string, string[]> | string[]
  ) {
    super(mensagem);
    this.name = 'ErroApi';
    this.codigoStatus = codigoStatus;
    this.erros = erros;
  }
}

function extrairMensagemErro(dados: PayloadErroBackend, status: number): string {
  if (dados.error) return dados.error;
  if (dados.mensagem) return dados.mensagem;
  if (dados.message) return dados.message;

  if (dados.errors) {
    if (Array.isArray(dados.errors) && dados.errors.length > 0) {
      return dados.errors[0];
    }
    const valores = Object.values(dados.errors).flat();
    if (valores.length > 0) {
      return valores[0];
    }
  }

  if (dados.title) return dados.title;
  return `Erro HTTP ${status}`;
}

export async function clienteApi<T>(
  endpoint: string,
  opcoes: RequestInit = {}
): Promise<T> {
  const endpointNormalizado = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${URL_BASE_API}${endpointNormalizado}`;

  const cabecalhos = new Headers(opcoes.headers || {});
  if (!cabecalhos.has('Content-Type') && opcoes.body) {
    cabecalhos.set('Content-Type', 'application/json');
  }

  const token = obterToken();
  if (token && !cabecalhos.has('Authorization')) {
    cabecalhos.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(url, {
    ...opcoes,
    headers: cabecalhos,
  });

  if (!resposta.ok) {
    const dadosErro: PayloadErroBackend = await resposta
      .json()
      .catch(() => ({}));
    const mensagem = extrairMensagemErro(dadosErro, resposta.status);
    throw new ErroApi(mensagem, resposta.status, dadosErro.errors);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const textoResposta = await resposta.text();
  if (!textoResposta.trim()) {
    return undefined as T;
  }

  return JSON.parse(textoResposta) as T;
}
