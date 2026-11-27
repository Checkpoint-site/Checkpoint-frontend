import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { limparBibliotecaLocal } from '@entities/index';
import { PaginaReview } from '@pages/index';
import { ROTAS } from '@shared/config';
import { removerToken, salvarToken } from '@shared/lib';

const TOKEN_AUTOR =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZW1haWwiOiJhdXRvckBjaGVja3BvaW50LmdnIn0.assinatura';

const renderizarPaginaReview = (caminho: string) =>
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <Routes>
        <Route path={ROTAS.REVIEW} element={<PaginaReview />} />
      </Routes>
    </MemoryRouter>
  );

describe('PaginaReview — Comentários e Blur de Spoiler sem mocks', () => {
  beforeEach(() => {
    removerToken();
    limparBibliotecaLocal();
    vi.restoreAllMocks();
  });

  it('aplica blur em review com spoiler vinda da API, libera com Ver assim mesmo e exibe aviso quando não há outras reviews', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/posts/55')) {
        return new Response(
          JSON.stringify({
            review: {
              idPost: 55,
              idUsuario: 2,
              autorNome: 'Rafael Moura',
              autorHandle: '@rafamoura',
              autorIniciais: 'RM',
              idJogo: 1,
              steamAppId: 1174180,
              jogoTitulo: 'Red Dead Redemption 2',
              jogoAno: 2018,
              jogoCapaUrl: 'https://steam/1174180.jpg',
              desenvolvedoraJogo: 'Rockstar Games',
              titulo: 'Final inesquecível',
              nota: 5.0,
              comentario: 'A cavalgada final do Arthur olhando o nascer do sol ainda me quebra.',
              status: 'zerado',
              tags: ['História marcante'],
              curtidas: 12,
              totalComentarios: 0,
              contemSpoiler: true,
              curtidaPeloUsuario: false,
              doUsuarioAtual: false,
              tempoAtras: 'há 1 h',
              dataCriacao: new Date().toISOString(),
            },
            comentarios: [],
            outrasReviews: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    renderizarPaginaReview('/review/55');

    const textoReview = await screen.findByText(/A cavalgada final do Arthur/i);
    expect(textoReview).toHaveAttribute('aria-hidden', 'true');
    expect(textoReview.className).toContain('blur-');
    expect(
      screen.getByText(/Ainda não existem outras avaliações na Fogueira/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver assim mesmo/i }));
    expect(textoReview).toHaveAttribute('aria-hidden', 'false');
    expect(textoReview.className).not.toContain('blur-');
  });

  it('permite publicar novo comentário com spoiler e revelar o blur', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/posts/10')) {
        return new Response(
          JSON.stringify({
            review: {
              idPost: 10,
              idUsuario: 1,
              autorNome: 'Lucas Andrade',
              autorHandle: '@lucas_souls',
              autorIniciais: 'LA',
              idJogo: 10,
              steamAppId: 1245620,
              jogoTitulo: 'Elden Ring',
              jogoAno: 2022,
              jogoCapaUrl: 'https://steam/1245620.jpg',
              desenvolvedoraJogo: 'FromSoftware',
              titulo: 'Obra-prima',
              nota: 5.0,
              comentario: 'Sair de Limgrave pela primeira vez é insuperável.',
              status: 'zerado',
              tags: [],
              curtidas: 3,
              totalComentarios: 0,
              contemSpoiler: false,
              curtidaPeloUsuario: false,
              doUsuarioAtual: false,
              tempoAtras: 'há 10 min',
              dataCriacao: new Date().toISOString(),
            },
            comentarios: [],
            outrasReviews: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    renderizarPaginaReview('/review/10');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Lucas Andrade/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Escreva um comentário/i), {
      target: { value: 'A luta secreta no final do mapa é surreal.' },
    });
    fireEvent.click(screen.getByLabelText(/Contém spoilers/i));
    fireEvent.click(screen.getByRole('button', { name: /Enviar comentário/i }));

    const textoNovoComentario = screen.getByText(/A luta secreta no final do mapa é surreal\./i);
    expect(textoNovoComentario).toHaveAttribute('aria-hidden', 'true');
    expect(textoNovoComentario.className).toContain('blur-');

    fireEvent.click(screen.getByRole('button', { name: /Ver assim mesmo/i }));
    expect(textoNovoComentario).toHaveAttribute('aria-hidden', 'false');
  });

  it('exibe fallback quando a review não existe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 404 })
    );

    renderizarPaginaReview('/review/rev-inexistente');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Review não encontrada/i })
    ).toBeInTheDocument();
  });

  it('permite excluir o próprio post na PaginaReview com confirmação e redireciona de volta ao jogo', async () => {
    salvarToken(TOKEN_AUTOR);
    let deletouPost77 = false;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const metodo = init?.method ?? 'GET';

      if (url.endsWith('/posts/77') && metodo === 'GET') {
        return new Response(
          JSON.stringify({
            review: {
              idPost: 77,
              idUsuario: 7,
              autorNome: 'Bruno Diniz',
              autorHandle: '@bruno_diniz',
              autorIniciais: 'BD',
              idJogo: 10,
              steamAppId: 1245620,
              jogoTitulo: 'Elden Ring',
              jogoAno: 2022,
              jogoCapaUrl: 'https://steam/1245620.jpg',
              desenvolvedoraJogo: 'FromSoftware',
              titulo: 'Minha análise',
              nota: 4.5,
              comentario: 'Review autoral para teste de exclusão.',
              status: 'zerado',
              tags: [],
              curtidas: 2,
              totalComentarios: 0,
              contemSpoiler: false,
              curtidaPeloUsuario: false,
              doUsuarioAtual: false,
              tempoAtras: 'agora mesmo',
              dataCriacao: new Date().toISOString(),
            },
            comentarios: [],
            outrasReviews: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/posts/77') && metodo === 'DELETE') {
        deletouPost77 = true;
        return new Response(null, { status: 204 });
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/review/77']}>
        <Routes>
          <Route path={ROTAS.REVIEW} element={<PaginaReview />} />
          <Route path={ROTAS.JOGO} element={<h1>Página do Jogo Destino</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Review autoral para teste de exclusão\./i)
    ).toBeInTheDocument();

    // Mesmo com doUsuarioAtual=false no DTO, o idUsuario=7 bate com sub="7" do token!
    fireEvent.click(screen.getByRole('button', { name: /Opções do post/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Excluir post/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancelar exclusão/i }));
    expect(deletouPost77).toBe(false);

    fireEvent.click(screen.getByRole('menuitem', { name: /Excluir post/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar exclusão do post/i }));

    await waitFor(() => {
      expect(deletouPost77).toBe(true);
    });
    expect(
      await screen.findByRole('heading', { name: /Página do Jogo Destino/i })
    ).toBeInTheDocument();
  });
});
