import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { limparBibliotecaLocal } from '@entities/index';
import { Header } from '@widgets/index';
import { HomePage, PaginaAvaliacao, PaginaJogo, PaginaReview } from '@pages/index';
import { ROTAS } from '@shared/config';
import { removerToken, salvarToken } from '@shared/lib';

const TOKEN_JOGADOR =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZW1haWwiOiJicmlub0BjaGVja3BvaW50LmdnIiwidW5pcXVlX25hbWUiOiJCcnVubyBEaW5peiJ9.assinatura';

describe('Integração Frontend ↔ Checkpoint-backend (Vitrine, Posts, Média de Fogueiras e Diário)', () => {
  beforeEach(() => {
    removerToken();
    limparBibliotecaLocal();
    vi.restoreAllMocks();
  });

  it('hidrata a HomePage com GET /api/v1/vitrine/home exibindo média de fogueiras e reviews do backend', async () => {
    salvarToken(TOKEN_JOGADOR);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/vitrine/home')) {
        return new Response(
          JSON.stringify({
            destaques: [
              {
                idJogo: 1,
                steamAppId: 620,
                nome: 'Portal 2',
                descricao: 'Quebra-cabeças com portais e humor ácido.',
                imagem: 'https://steam/620.jpg',
                desenvolvedora: 'Valve',
                publicadora: 'Valve',
                anoLancamento: 2011,
                gratuito: false,
                emBreve: false,
                percentualDesconto: 80,
                pontuacaoCuradoria: 95,
                mediaFogueiras: 4.9,
                totalAvaliacoes: 320,
                generos: ['Aventura', 'Acao'],
              },
            ],
            generosDisponiveis: [
              { slug: 'todos', nome: 'Todos' },
              { slug: 'aventura', nome: 'Aventura' },
            ],
            secoes: [
              {
                id: 'reviews-comunidade',
                titulo: 'Na Fogueira Agora',
                subtitulo: 'Reviews em tempo real',
                tipo: 'REVIEWS',
                jogos: [],
                reviews: [
                  {
                    idPost: 42,
                    idUsuario: 9,
                    autorNome: 'Carla Mendes',
                    autorHandle: '@carla_mendes',
                    autorIniciais: 'CM',
                    idJogo: 1,
                    steamAppId: 620,
                    jogoTitulo: 'Portal 2',
                    jogoAno: 2011,
                    jogoCapaUrl: 'https://steam/620.jpg',
                    desenvolvedoraJogo: 'Valve',
                    titulo: 'Genial do início ao fim',
                    nota: 4.5,
                    comentario: 'Wheatley e GLaDOS carregam cada diálogo.',
                    status: 'zerado',
                    tags: ['História marcante'],
                    curtidas: 12,
                    totalComentarios: 3,
                    contemSpoiler: false,
                    curtidaPeloUsuario: false,
                    doUsuarioAtual: false,
                    tempoAtras: 'há 5 min',
                    dataCriacao: new Date().toISOString(),
                  },
                ],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: /Portal 2/i }, { timeout: 10000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Carla Mendes/i)).toBeInTheDocument();
    expect(screen.getByText(/Wheatley e GLaDOS carregam cada diálogo/i)).toBeInTheDocument();
  }, 15000);

  it('envia avaliação de meia chama (4.5) para PUT /api/v1/diario/jogos/{steamAppId}/avaliacao e atualiza a média do jogo', async () => {
    salvarToken(TOKEN_JOGADOR);

    const chamadasPut: string[] = [];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const metodo = init?.method ?? 'GET';

      if (url.includes('/diario/me')) {
        return new Response(
          JSON.stringify({
            idUsuario: 7,
            resumo: {
              jogados: 0,
              queroJogar: 0,
              favoritos: 0,
              reviews: 0,
              mediaFogueirasUsuario: 0,
            },
            registros: [],
            reviewsUsuario: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.includes('/diario/jogos/1245620/avaliacao') && metodo === 'PUT') {
        chamadasPut.push(String(init?.body ?? ''));
        return new Response(
          JSON.stringify({
            registro: {
              idJogo: 10,
              steamAppId: 1245620,
              jogoTitulo: 'Elden Ring',
              jogoCapaUrl: 'https://steam/1245620.jpg',
              jogoAno: 2022,
              desenvolvedora: 'FromSoftware',
              generos: ['Rpg', 'Acao'],
              notaMediaJogo: 4.5,
              totalAvaliacoesJogo: 1,
              status: 'zerado',
              jogado: true,
              queroJogar: false,
              favorito: true,
              nota: 4.5,
              tags: ['Direção de arte'],
              idPostReview: 99,
              comentario: 'Limgrave é inesquecível.',
              contemSpoiler: false,
              atualizadoEm: new Date().toISOString(),
            },
            reviewPublicada: {
              idPost: 99,
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
              titulo: 'Limgrave é inesquecível.',
              nota: 4.5,
              comentario: 'Limgrave é inesquecível.',
              status: 'zerado',
              tags: ['Direção de arte'],
              curtidas: 0,
              totalComentarios: 0,
              contemSpoiler: false,
              curtidaPeloUsuario: false,
              doUsuarioAtual: true,
              tempoAtras: 'agora mesmo',
              dataCriacao: new Date().toISOString(),
            },
            mediaFogueirasJogo: 4.5,
            totalAvaliacoesJogo: 1,
            distribuicaoFogueiras: [
              { estrelas: 5, quantidade: 1, percentual: 100 },
              { estrelas: 4, quantidade: 0, percentual: 0 },
              { estrelas: 3, quantidade: 0, percentual: 0 },
              { estrelas: 2, quantidade: 0, percentual: 0 },
              { estrelas: 1, quantidade: 0, percentual: 0 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.includes('/jogos/1245620')) {
        return new Response(
          JSON.stringify({
            idJogo: 10,
            steamAppId: 1245620,
            nome: 'Elden Ring',
            descricao: 'Action RPG épico.',
            imagem: 'https://steam/1245620.jpg',
            desenvolvedora: 'FromSoftware',
            publicadora: 'Bandai Namco',
            generos: ['Rpg', 'Acao'],
            anoLancamento: 2022,
            totalRecomendacoes: 500000,
            gratuito: false,
            emBreve: false,
            percentualDesconto: 0,
            sincronizadoEm: new Date().toISOString(),
            mediaFogueiras: 4.5,
            totalAvaliacoes: 1,
            distribuicaoFogueiras: [
              { estrelas: 5, quantidade: 1, percentual: 100 },
              { estrelas: 4, quantidade: 0, percentual: 0 },
              { estrelas: 3, quantidade: 0, percentual: 0 },
              { estrelas: 2, quantidade: 0, percentual: 0 },
              { estrelas: 1, quantidade: 0, percentual: 0 },
            ],
            jogosRelacionados: [],
            engajamentoComunidade: {
              quantidadeCurtida: 0,
              presencaPost: 1,
              presencaComentario: 0,
              presencaFavoritos: 1,
              presencaPretendeJogar: 0,
              somaFogueiras: 4.5,
              totalAvaliacoes: 1,
              mediaFogueiras: 4.5,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.includes('/posts/jogo/1245620')) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/jogo/elden-ring/avaliar']}>
        <Routes>
          <Route path={ROTAS.JOGO} element={<PaginaJogo />} />
          <Route path={ROTAS.AVALIAR_JOGO} element={<PaginaAvaliacao />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Dar nota 4\.5/i }));
    fireEvent.click(screen.getByRole('button', { name: /Direção de arte/i }));
    fireEvent.change(screen.getByLabelText(/Sua review/i), {
      target: { value: 'Limgrave é inesquecível.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar avaliação/i }));

    await waitFor(() => {
      expect(chamadasPut.length).toBe(1);
    });

    const payloadEnviado = JSON.parse(chamadasPut[0]);
    expect(payloadEnviado.nota).toBe(4.5);
    expect(payloadEnviado.tags).toContain('Direção de arte');
    expect(await screen.findByText(/Bruno Diniz/i)).toBeInTheDocument();
  });

  it('carrega review numérica via GET /api/v1/posts/{id}, envia comentário e curte pelo backend', async () => {
    salvarToken(TOKEN_JOGADOR);
    let curtiuPost = false;
    let enviouComentario = false;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const metodo = init?.method ?? 'GET';

      if (url.includes('/diario/me')) {
        return new Response(
          JSON.stringify({
            idUsuario: 7,
            resumo: { jogados: 0, queroJogar: 0, favoritos: 0, reviews: 0, mediaFogueirasUsuario: 0 },
            registros: [],
            reviewsUsuario: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/posts/42') && metodo === 'GET') {
        return new Response(
          JSON.stringify({
            review: {
              idPost: 42,
              idUsuario: 9,
              autorNome: 'Carla Mendes',
              autorHandle: '@carla_mendes',
              autorIniciais: 'CM',
              idJogo: 1,
              steamAppId: 292030,
              jogoTitulo: 'The Witcher 3: Wild Hunt',
              jogoAno: 2015,
              jogoCapaUrl: 'https://steam/292030.jpg',
              desenvolvedoraJogo: 'CD PROJEKT RED',
              titulo: 'Barão Sangrento',
              nota: 5.0,
              comentario: 'A quest do Barão Sangrento é puro cinema.',
              status: 'zerado',
              tags: ['História marcante'],
              curtidas: 4,
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

      if (url.endsWith('/posts/42/curtir') && metodo === 'POST') {
        curtiuPost = true;
        return new Response(
          JSON.stringify({ idAlvo: 42, curtido: true, quantidadeCurtidas: 5 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/posts/42/comentarios') && metodo === 'POST') {
        enviouComentario = true;
        return new Response(
          JSON.stringify({
            idComentario: 77,
            idPost: 42,
            idUsuario: 7,
            autorNome: 'Bruno Diniz',
            autorHandle: '@bruno_diniz',
            autorIniciais: 'BD',
            texto: 'Melhor arco secundário dos RPGs!',
            curtidas: 0,
            contemSpoiler: false,
            curtidaPeloUsuario: false,
            doUsuarioAtual: true,
            tempoAtras: 'agora mesmo',
            dataCriacao: new Date().toISOString(),
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/review/42']}>
        <Routes>
          <Route path={ROTAS.REVIEW} element={<PaginaReview />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/A quest do Barão Sangrento é puro cinema/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /4 curtidas/i }));
    await waitFor(() => expect(curtiuPost).toBe(true));

    fireEvent.change(screen.getByLabelText(/Escreva um comentário/i), {
      target: { value: 'Melhor arco secundário dos RPGs!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar comentário/i }));

    await waitFor(() => expect(enviouComentario).toBe(true));
    expect(await screen.findByText(/Melhor arco secundário dos RPGs!/i)).toBeInTheDocument();
  });

  it('consulta GET /api/v1/jogos/busca na barra de pesquisa do Header e exibe resultados com média de fogueiras', async () => {
    salvarToken(TOKEN_JOGADOR);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/jogos/busca')) {
        return new Response(
          JSON.stringify({
            tipoBusca: 'nome',
            jogoBuscado: 'Chrono',
            algoritmoAplicado: 'popularidade',
            totalResultados: 1,
            itens: [
              {
                idJogo: 55,
                steamAppId: 613830,
                nome: 'CHRONO TRIGGER',
                descricao: 'Clássico atemporal de viagem no tempo.',
                imagem: 'https://steam/613830.jpg',
                desenvolvedora: 'Square Enix',
                publicadora: 'Square Enix',
                anoLancamento: 1995,
                gratuito: false,
                emBreve: false,
                percentualDesconto: 50,
                pontuacaoCuradoria: 98,
                mediaFogueiras: 4.9,
                totalAvaliacoes: 85,
                generos: ['Rpg'],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Abrir pesquisa/i }));
    fireEvent.change(screen.getByLabelText(/Buscar jogo pelo nome/i), {
      target: { value: 'Chrono' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Executar pesquisa/i }));

    expect(await screen.findByText(/CHRONO TRIGGER/i)).toBeInTheDocument();
    expect(screen.getByText(/Square Enix · 1995/i)).toBeInTheDocument();
  });

  it('permite excluir apenas o próprio post via DELETE /api/v1/posts/{id} e remove imediatamente da tela', async () => {
    salvarToken(TOKEN_JOGADOR);
    let idPostExcluido: number | null = null;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const metodo = init?.method ?? 'GET';

      if (url.includes('/diario/me')) {
        return new Response(
          JSON.stringify({
            idUsuario: 7,
            resumo: {
              jogados: 1,
              queroJogar: 0,
              favoritos: 0,
              reviews: 1,
              mediaFogueirasUsuario: 4.5,
            },
            registros: [],
            reviewsUsuario: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.includes('/jogos/1245620')) {
        return new Response(
          JSON.stringify({
            idJogo: 10,
            steamAppId: 1245620,
            nome: 'Elden Ring',
            descricao: 'Action RPG épico.',
            imagem: 'https://steam/1245620.jpg',
            desenvolvedora: 'FromSoftware',
            publicadora: 'Bandai Namco',
            generos: ['Rpg', 'Acao'],
            anoLancamento: 2022,
            totalRecomendacoes: 500000,
            gratuito: false,
            emBreve: false,
            percentualDesconto: 0,
            sincronizadoEm: new Date().toISOString(),
            mediaFogueiras: 4.5,
            totalAvaliacoes: 2,
            distribuicaoFogueiras: [],
            jogosRelacionados: [],
            engajamentoComunidade: {
              quantidadeCurtida: 0,
              presencaPost: 2,
              presencaComentario: 0,
              presencaFavoritos: 0,
              presencaPretendeJogar: 0,
              somaFogueiras: 9,
              totalAvaliacoes: 2,
              mediaFogueiras: 4.5,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.includes('/posts/jogo/1245620')) {
        return new Response(
          JSON.stringify([
            {
              idPost: 99,
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
              titulo: 'Meu post autoral',
              nota: 4.5,
              comentario: 'Post do próprio jogador que deve poder ser apagado.',
              status: 'zerado',
              tags: [],
              curtidas: 1,
              totalComentarios: 0,
              contemSpoiler: false,
              curtidaPeloUsuario: false,
              doUsuarioAtual: true,
              tempoAtras: 'há 2 min',
              dataCriacao: new Date().toISOString(),
            },
            {
              idPost: 100,
              idUsuario: 12,
              autorNome: 'Outro Viajante',
              autorHandle: '@outro_viajante',
              autorIniciais: 'OV',
              idJogo: 10,
              steamAppId: 1245620,
              jogoTitulo: 'Elden Ring',
              jogoAno: 2022,
              jogoCapaUrl: 'https://steam/1245620.jpg',
              desenvolvedoraJogo: 'FromSoftware',
              titulo: 'Post de terceiro',
              nota: 5.0,
              comentario: 'Post de outra pessoa que permanece intacto.',
              status: 'zerado',
              tags: [],
              curtidas: 3,
              totalComentarios: 0,
              contemSpoiler: false,
              curtidaPeloUsuario: false,
              doUsuarioAtual: false,
              tempoAtras: 'há 1 h',
              dataCriacao: new Date().toISOString(),
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/posts/99') && metodo === 'DELETE') {
        idPostExcluido = 99;
        return new Response(null, { status: 204 });
      }

      return new Response(JSON.stringify({}), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/jogo/1245620']}>
        <Routes>
          <Route path={ROTAS.JOGO} element={<PaginaJogo />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Post do próprio jogador que deve poder ser apagado\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Post de outra pessoa que permanece intacto\./i)
    ).toBeInTheDocument();

    const botoesMenuOpcoes = screen.getAllByRole('button', { name: /Opções do post/i });
    expect(botoesMenuOpcoes).toHaveLength(1);
    expect(screen.queryByRole('menuitem', { name: /Excluir post/i })).not.toBeInTheDocument();

    fireEvent.click(botoesMenuOpcoes[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /Excluir post/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar exclusão do post/i }));

    await waitFor(() => {
      expect(idPostExcluido).toBe(99);
    });

    expect(
      screen.queryByText(/Post do próprio jogador que deve poder ser apagado\./i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Post de outra pessoa que permanece intacto\./i)
    ).toBeInTheDocument();
  });
});
