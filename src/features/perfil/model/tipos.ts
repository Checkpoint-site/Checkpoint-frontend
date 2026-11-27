export interface JogoResumo {
  idJogo?: number;
  steamAppId: number;
  nome: string;
  imagemCapaUrl: string;
  generoPrincipal?: string;
  anoLancamento?: number;
  notaMetacritic?: number;
  avaliacaoUsuario?: number; // 1 a 5 estrelas/fogueiras
  dataRegistro?: string;
}

export interface EstanteFavoritos {
  idCatalogo: number;
  exibirNoTopoPerfil: boolean;
  jogoDestaquePerfilId?: number | null;
  observacaoDestaque?: string | null;
  totalJogos: number;
  dataAtualizacao: string;
  jogos: JogoResumo[];
}

export interface EstantePretendeJogar {
  idCatalogo: number;
  nivelPrioridade: number;
  notificarEmPromocao: boolean;
  metaAnoConclusao?: number | null;
  totalJogos: number;
  dataAtualizacao: string;
  jogos: JogoResumo[];
}

export interface EstantesUsuario {
  idUsuario: number;
  favoritos: EstanteFavoritos;
  pretendeJogar: EstantePretendeJogar;
}

export interface PerfilUsuario {
  id: number;
  nome: string;
  email: string;
  fotoPerfil?: string | null;
  biografiaGamer?: string;
  nivelGamer: number;
  pontosExperiencia: number;
  quantidadeSeguidores: number;
  quantidadeSeguindo: number;
  totalJogos: number;
  jogosFinalizadosAno: number;
  tipoPerfil: 'Regular' | 'Moderador' | 'Administrador';
  favoritos: JogoResumo[];
  atividadeRecente: JogoResumo[];
  distribuicaoNotas: Record<number, number>; // ex: { 1: 2, 2: 4, 3: 15, 4: 28, 5: 12 }
}
