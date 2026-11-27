import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { limparBibliotecaLocal } from '@entities/index';
import { PaginaAvaliacao, PaginaJogo } from '@pages/index';
import { ROTAS } from '@shared/config';

const DETALHES_ELDEN_RING = {
  idJogo: 10,
  steamAppId: 1245620,
  nome: 'Elden Ring',
  descricao: 'Action RPG nas Terras Intermédias.',
  imagem: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
  desenvolvedora: 'FromSoftware',
  publicadora: 'Bandai Namco',
  generos: ['Rpg', 'Acao'],
  anoLancamento: 2022,
  totalRecomendacoes: 500000,
  gratuito: false,
  emBreve: false,
  percentualDesconto: 0,
  sincronizadoEm: new Date().toISOString(),
  mediaFogueiras: 0,
  totalAvaliacoes: 0,
  distribuicaoFogueiras: [],
  jogosRelacionados: [],
};

const renderizarRotasJogo = (caminho: string) =>
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <Routes>
        <Route path={ROTAS.JOGO} element={<PaginaJogo />} />
        <Route path={ROTAS.AVALIAR_JOGO} element={<PaginaAvaliacao />} />
      </Routes>
    </MemoryRouter>
  );

describe('PaginaJogo e PaginaAvaliacao — Fluxo principal sem mocks', () => {
  beforeEach(() => {
    limparBibliotecaLocal();
    vi.restoreAllMocks();
  });

  it('renderiza detalhes do jogo vindos da API com tag Ainda não avaliado quando sem notas', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/jogos/1245620')) {
        return new Response(JSON.stringify(DETALHES_ELDEN_RING), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes('/posts/jogo/1245620')) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    renderizarRotasJogo('/jogo/1245620');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Elden Ring/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Ainda não avaliado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Seja a primeira pessoa a avaliar Elden Ring/i)).toBeInTheDocument();
  });

  it('permite avaliar na página dedicada sem emotes/horas/plataforma e exibe review com blur de spoiler', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/jogos/1245620')) {
        return new Response(JSON.stringify(DETALHES_ELDEN_RING), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes('/posts/jogo/1245620')) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    renderizarRotasJogo('/jogo/1245620/avaliar');

    expect(
      await screen.findByRole('heading', { level: 2, name: /Avaliar este jogo/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Horas jogadas/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Plataforma/i)).not.toBeInTheDocument();

    const botaoJogando = screen.getByRole('button', { name: /Jogando/i });
    expect(botaoJogando.textContent).not.toMatch(/[🏆🎮📌⏸]/);
    fireEvent.click(botaoJogando);

    fireEvent.click(screen.getByRole('button', { name: /Dar nota 4\.5/i }));
    fireEvent.click(screen.getByRole('button', { name: /Trilha sonora/i }));
    fireEvent.change(screen.getByLabelText(/Sua review/i), {
      target: { value: 'O chefe final me fez arrepiar inteiro.' },
    });
    fireEvent.click(screen.getByLabelText(/Contém spoilers/i));
    fireEvent.click(screen.getByRole('button', { name: /Publicar avaliação/i }));

    const secaoReviews = await screen.findByRole('region', { name: /Reviews da Comunidade/i });
    expect(within(secaoReviews).getByText(/Contém spoilers/i)).toBeInTheDocument();
    expect(within(secaoReviews).getByText(/Trilha sonora/i)).toBeInTheDocument();

    const paragrafoSpoiler = within(secaoReviews).getByText(
      /O chefe final me fez arrepiar inteiro\./i
    );
    expect(paragrafoSpoiler).toHaveAttribute('aria-hidden', 'true');
    expect(paragrafoSpoiler.className).toContain('blur-');

    fireEvent.click(within(secaoReviews).getByRole('button', { name: /Ver assim mesmo/i }));
    expect(paragrafoSpoiler).toHaveAttribute('aria-hidden', 'false');
    expect(paragrafoSpoiler.className).not.toContain('blur-');
  });

  it('exibe estado amigável quando o jogo não existe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 404 })
    );

    renderizarRotasJogo('/jogo/jogo-inexistente');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Essa fogueira ainda não foi acesa/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para a Fogueira/i })).toHaveAttribute(
      'href',
      ROTAS.INICIO
    );
  });
});
