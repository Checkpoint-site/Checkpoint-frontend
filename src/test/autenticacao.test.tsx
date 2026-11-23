import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { obterToken, removerToken } from '@shared/lib';
import { PaginaLogin, PaginaCadastro } from '@pages/index';

describe('Páginas de Autenticação (Login e Cadastro)', () => {
  beforeEach(() => {
    removerToken();
    vi.restoreAllMocks();
  });

  it('renderiza a PaginaLogin e autentica no endpoint POST /login salvando o token no shared', async () => {
    const espiarFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'token-jwt-login-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <PaginaLogin />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /Bem-vindo de volta à fogueira/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/E-mail da Conta/i), {
      target: { value: 'jogador@checkpoint.gg' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'senha123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Entrar no Checkpoint/i })
    );

    await waitFor(() => {
      expect(espiarFetch).toHaveBeenCalledTimes(1);
      expect(obterToken()).toBe('token-jwt-login-123');
    });
  });

  it('executa o fluxo de Cadastro em 2 etapas integrando os 3 endpoints de /cadastro e armazena o token', async () => {
    const espiarFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ disponivel: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            mensagem: 'Código de verificação enviado com sucesso.',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'token-jwt-cadastro-999' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <PaginaCadastro />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nome ou Apelido no Checkpoint/i), {
      target: { value: 'JogadorUm' },
    });
    fireEvent.change(screen.getByLabelText(/^E-mail$/i), {
      target: { value: 'jogador@checkpoint.gg' },
    });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), {
      target: { value: 'minhasenha123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Continuar e Receber Código/i })
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Código de Verificação \(6 dígitos\)/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByLabelText(/Código de Verificação \(6 dígitos\)/i),
      {
        target: { value: '654321' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Acender Fogueira e Criar Conta/i })
    );

    await waitFor(() => {
      expect(espiarFetch).toHaveBeenCalledTimes(3);
      expect(obterToken()).toBe('token-jwt-cadastro-999');
    });
  });
});
