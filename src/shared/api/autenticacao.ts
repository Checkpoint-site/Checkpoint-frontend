import { salvarToken, removerToken } from '../lib/armazenamentoToken';
import { clienteApi } from './base';
import { ENDPOINTS_API } from './endpoints';

/**
 * Contratos de dados espelhados dos DTOs do Checkpoint-backend (.NET 10)
 */
export interface LoginRequestDto {
  email: string;
  senha: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface VerificarEmailRequestDto {
  email: string;
}

export interface VerificarEmailResponseDto {
  disponivel: boolean;
}

export interface SolicitarCodigoRequestDto {
  email: string;
}

export interface SolicitarCodigoResponseDto {
  mensagem: string;
}

export interface CadastroRequestDto {
  nome: string;
  email: string;
  senha: string;
  codigo: string;
}

export interface CadastroResponseDto {
  token: string;
}

/**
 * Serviço no shared/api que interliga o Frontend diretamente aos Endpoints do Checkpoint-backend:
 * - POST /api/v1/login (LoginEndpoint.cs)
 * - POST /api/v1/cadastro/verificar-disponibilidade (CadastroEndpoint.cs)
 * - POST /api/v1/cadastro/solicitar-codigo (CadastroEndpoint.cs)
 * - POST /api/v1/cadastro (CadastroEndpoint.cs)
 */
export const autenticacaoApi = {
  async autenticar(dados: LoginRequestDto): Promise<LoginResponseDto> {
    const resposta = await clienteApi<LoginResponseDto>(
      ENDPOINTS_API.AUTENTICACAO.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );

    if (resposta.token) {
      salvarToken(resposta.token);
    }

    return resposta;
  },

  async verificarDisponibilidadeEmail(
    dados: VerificarEmailRequestDto
  ): Promise<VerificarEmailResponseDto> {
    return clienteApi<VerificarEmailResponseDto>(
      ENDPOINTS_API.AUTENTICACAO.VERIFICAR_DISPONIBILIDADE,
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
  },

  async solicitarCodigo(
    dados: SolicitarCodigoRequestDto
  ): Promise<SolicitarCodigoResponseDto> {
    return clienteApi<SolicitarCodigoResponseDto>(
      ENDPOINTS_API.AUTENTICACAO.SOLICITAR_CODIGO,
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
  },

  async cadastrar(dados: CadastroRequestDto): Promise<CadastroResponseDto> {
    const resposta = await clienteApi<CadastroResponseDto>(
      ENDPOINTS_API.AUTENTICACAO.CADASTRO,
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );

    if (resposta.token) {
      salvarToken(resposta.token);
    }

    return resposta;
  },

  sair(): void {
    removerToken();
  },
};
