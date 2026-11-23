/**
 * Mapeamento centralizado dos Endpoints do Checkpoint-backend (.NET 10)
 * Baseado em:
 * - Api/Program.cs -> app.MapGroup("/api/v1")
 * - Api/Endpoints/LoginEndpoint.cs -> app.MapGroup("/login")
 * - Api/Endpoints/CadastroEndpoint.cs -> app.MapGroup("/cadastro")
 */
export const ENDPOINTS_API = {
  AUTENTICACAO: {
    LOGIN: '/login',
    CADASTRO: '/cadastro',
    VERIFICAR_DISPONIBILIDADE: '/cadastro/verificar-disponibilidade',
    SOLICITAR_CODIGO: '/cadastro/solicitar-codigo',
  },
} as const;
