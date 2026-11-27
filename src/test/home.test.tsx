import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppRouter } from '@app/providers';
import { limparBibliotecaLocal } from '@entities/index';
import { removerToken, salvarToken } from '@shared/lib';
import { ROTAS } from '@shared/config';
import { HomePage, PaginaAvaliacao, PaginaJogo } from '@pages/index';

const TOKEN_TESTE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImJydW5vQGV4ZW1wbG8uY29tIn0.assinatura';

const VITRINE_API_FAKE = {
  destaques: [
    {
      idJogo: 1,
      steamAppId: 1245620,
      nome: 'Elden Ring',
      descricao: 'Ergue-te, Maculado, e atravessa as Terras Intermédias.',
      imagem: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
      desenvolvedora: 'FromSoftware',
      publicadora: 'Bandai Namco',
      anoLancamento: 2022,
      gratuito: false,
      emBreve: false,
      percentualDesconto: 0,
      pontuacaoCuradoria: 98,
      mediaFogueiras: 0,
      totalAvaliacoes: 0,
      generos: ['Rpg', 'Acao'],
    },
  ],
  generosDisponiveis: [
    { slug: 'todos', nome: 'Todos' },
    { slug: 'rpg', nome: 'RPG' },
    { slug: 'terror', nome: 'Terror' },
  ],
  secoes: [
    {
      id: 'top-10-fogueira',
      titulo: 'Top 10 na Fogueira Hoje',
      subtitulo: 'Jogos em alta na comunidade',
      tipo: 'TOP_10',
      jogos: [
        {
          idJogo: 2,
          steamAppId: 2124490,
          nome: 'Silent Hill 2',
          descricao: 'Retorno à cidade coberta de névoa.',
          imagem: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/header.jpg',
          desenvolvedora: 'Bloober Team',
          publicadora: 'Konami',
          anoLancamento: 2024,
          gratuito: false,
          emBreve: false,
          percentualDesconto: 0,
          pontuacaoCuradoria: 92,
          mediaFogueiras: 0,
          totalAvaliacoes: 0,
          generos: ['Terror'],
        },
      ],
      reviews: [],
    },
    {
      id: 'reviews-comunidade',
      titulo: 'Na Fogueira Agora',
      subtitulo: 'O que a galera acabou de avaliar',
      tipo: 'REVIEWS',
      jogos: [],
      reviews: [],
    },
  ],
};

describe('HomePage — Vitrine integrada à API sem mocks', () => {
  beforeEach(() => {
    removerToken();
    limparBibliotecaLocal();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('exibe a tela inicial Descanse na Fogueira sem consultar a vitrine quando o visitante não está autenticado', () => {
    const espiarFetch = vi.spyOn(globalThis, 'fetch');

    render(
      <MemoryRouter initialEntries={[ROTAS.INICIO]}>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /Descanse na Fogueira/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Criar Conta$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Já tenho conta \(Entrar\)/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sua Estante na Fogueira/i)).not.toBeInTheDocument();
    expect(espiarFetch).not.toHaveBeenCalled();
  });

  it('redireciona visitante não autenticado para /login ao tentar acessar rota interna da área principal', async () => {
    window.history.pushState({}, '', '/jogo/1245620');

    render(<AppRouter />);

    expect(
      await screen.findByRole('heading', { name: /Bem-vindo de volta à fogueira/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Explorar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Minha Estante/i })).not.toBeInTheDocument();
  });

  it('exibe aviso limpo quando nem /vitrine/home nem /vitrine/fallback possuem jogos', async () => {
    salvarToken(TOKEN_TESTE);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 404 })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Ainda não existem jogos carregados na vitrine/i,
      })
    ).toBeInTheDocument();
  });

  it('usa /vitrine/fallback quando /vitrine/home falha, exibe tag Ainda não avaliado e aviso de reviews vazias', async () => {
    salvarToken(TOKEN_TESTE);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/vitrine/fallback')) {
        return new Response(JSON.stringify(VITRINE_API_FAKE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: /Elden Ring/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/bruno@exemplo\.com/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Ainda não avaliado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ainda não existem avaliações na Fogueira/i)).toBeInTheDocument();
  });

  it('filtra jogos por gênero e navega para a página dedicada de avaliação', async () => {
    salvarToken(TOKEN_TESTE);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/vitrine/home')) {
        return new Response(JSON.stringify(VITRINE_API_FAKE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={[ROTAS.INICIO]}>
        <Routes>
          <Route path={ROTAS.INICIO} element={<HomePage />} />
          <Route path={ROTAS.JOGO} element={<PaginaJogo />} />
          <Route path={ROTAS.AVALIAR_JOGO} element={<PaginaAvaliacao />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: /Elden Ring/i })
    ).toBeInTheDocument();

    const botaoTerror = screen.getByRole('button', { name: /^Terror$/i });
    fireEvent.click(botaoTerror);
    expect(botaoTerror).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Silent Hill 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Registrar \/ Avaliar/i }));
    expect(
      await screen.findByRole('heading', { level: 2, name: /Avaliar este jogo/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Horas jogadas/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Plataforma/i)).not.toBeInTheDocument();
  });
});
