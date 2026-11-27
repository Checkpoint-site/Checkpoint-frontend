import type {
  ComentarioReview,
  GeneroJogo,
  JogoResumo,
  RespostaVitrineHome,
  ReviewComunidade,
} from './tipos';

export const GENEROS_DISPONIVEIS: GeneroJogo[] = [
  { slug: 'todos', nome: 'Todos' },
  { slug: 'rpg', nome: 'RPG' },
  { slug: 'soulslike', nome: 'Soulslike' },
  { slug: 'acao', nome: 'Ação & Aventura' },
  { slug: 'indie', nome: 'Indie' },
  { slug: 'terror', nome: 'Terror' },
  { slug: 'coop', nome: 'Co-op' },
];

export const COMENTARIOS_INICIAIS_MOCK: ComentarioReview[] = [];
export const REVIEWS_INICIAIS_MOCK: ReviewComunidade[] = [];
export const TODOS_OS_JOGOS_MOCK: JogoResumo[] = [];

export const buscarJogoPorId = (id: string): JogoResumo | undefined =>
  TODOS_OS_JOGOS_MOCK.find((jogo) => jogo.id === id);

export const obterJogosRelacionados = (_jogo: JogoResumo, _limite = 6): JogoResumo[] => [];

export interface FaixaDistribuicaoNota {
  estrelas: 5 | 4 | 3 | 2 | 1;
  percentual: number;
}

export const calcularDistribuicaoNotas = (_notaMedia: number): FaixaDistribuicaoNota[] => [
  { estrelas: 5, percentual: 0 },
  { estrelas: 4, percentual: 0 },
  { estrelas: 3, percentual: 0 },
  { estrelas: 2, percentual: 0 },
  { estrelas: 1, percentual: 0 },
];

export const VITRINE_HOME_MOCK: RespostaVitrineHome = {
  destaques: [],
  generosDisponiveis: GENEROS_DISPONIVEIS,
  secoes: [],
};
