export interface GeneroJogo {
  slug: string;
  nome: string;
}

export type StatusBiblioteca = 'jogando' | 'zerado' | 'quero_jogar' | 'abandonado';

export interface JogoResumo {
  id: string;
  steamAppId?: number;
  titulo: string;
  ano: number;
  notaMedia: number;
  totalAvaliacoes: number;
  generos: string[];
  generosSlugs: string[];
  desenvolvedora: string;
  plataformaPrincipal: string;
  sinopseCurta: string;
  /** URL opcional vinda da API (Steam Storefront API). Quando ausente, renderiza capa estilizada. */
  capaUrl?: string;
  /** URL opcional de banner widescreen para o destaque principal. */
  bannerUrl?: string;
  /** Paleta de fallback para a arte estilizada da capa */
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  emblema: 'espada' | 'fogo' | 'coroa' | 'controle' | 'estrela' | 'caveira' | 'escudo' | 'lua';
  badge?: string;
}

export interface ReviewComunidade {
  id: string;
  idPostBackend?: number;
  autorNome: string;
  autorHandle: string;
  autorIniciais: string;
  autorFotoPerfil?: string;
  jogoId: string;
  steamAppId?: number;
  jogoTitulo: string;
  jogoAno: number;
  jogoCorPrimaria: string;
  jogoCorSecundaria: string;
  jogoCorAcento: string;
  jogoCapaUrl?: string;
  nota: number;
  comentario: string;
  curtidas: number;
  totalComentarios?: number;
  curtidaPeloUsuario?: boolean;
  tempoAtras: string;
  horasJogadas?: number;
  plataformaJogada?: string;
  status?: StatusBiblioteca;
  tags?: string[];
  contemSpoiler?: boolean;
  doUsuarioAtual?: boolean;
}

export interface ComentarioReview {
  id: string;
  idComentarioBackend?: number;
  reviewId: string;
  autorNome: string;
  autorHandle: string;
  autorIniciais: string;
  autorFotoPerfil?: string;
  texto: string;
  curtidas?: number;
  curtidaPeloUsuario?: boolean;
  tempoAtras: string;
  contemSpoiler?: boolean;
  doUsuarioAtual?: boolean;
}

export interface RegistroJogoUsuario {
  jogoId: string;
  steamAppId?: number;
  status?: StatusBiblioteca;
  jogado?: boolean;
  queroJogar?: boolean;
  favorito?: boolean;
  nota?: number;
  horasJogadas?: number;
  plataformaJogada?: string;
  tags?: string[];
  idPostReview?: number;
  comentario?: string;
  contemSpoiler?: boolean;
  atualizadoEm: string;
}

export interface SecaoVitrineJogos {
  id: string;
  titulo: string;
  subtitulo?: string;
  tipo: 'JOGOS' | 'TOP_10';
  filtroGenero?: string;
  itens: JogoResumo[];
}

export interface SecaoVitrineReviews {
  id: string;
  titulo: string;
  subtitulo?: string;
  tipo: 'REVIEWS';
  itens: ReviewComunidade[];
}

export type SecaoVitrine = SecaoVitrineJogos | SecaoVitrineReviews;

/**
 * Contrato integrado ao endpoint:
 * GET /api/v1/vitrine/home
 */
export interface RespostaVitrineHome {
  destaques: JogoResumo[];
  generosDisponiveis: GeneroJogo[];
  secoes: SecaoVitrine[];
}
