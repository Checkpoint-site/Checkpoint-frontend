import { describe, it, expect, beforeEach } from 'vitest';
import {
  salvarToken,
  obterToken,
  removerToken,
  possuiToken,
  decodificarPayloadToken,
} from '@shared/lib';

describe('Utilitário armazenamentoToken (shared)', () => {
  beforeEach(() => {
    removerToken();
  });

  it('armazena e recupera o token JWT corretamente', () => {
    expect(possuiToken()).toBe(false);
    expect(obterToken()).toBeNull();

    salvarToken('jwt-token-exemplo');

    expect(possuiToken()).toBe(true);
    expect(obterToken()).toBe('jwt-token-exemplo');
  });

  it('remove o token JWT ao sair da conta', () => {
    salvarToken('jwt-token-ativo');
    expect(possuiToken()).toBe(true);

    removerToken();

    expect(possuiToken()).toBe(false);
    expect(obterToken()).toBeNull();
  });

  it('decodifica o payload de um token JWT válido', () => {
    const tokenFalso =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImdhbWVyQGNoZWNrcG9pbnQuZ2cifQ.assinatura';

    const payload = decodificarPayloadToken(tokenFalso);
    expect(payload).toEqual({
      sub: '123',
      email: 'gamer@checkpoint.gg',
    });
  });
});
