import type {
  ComentarioBackendDto,
  FaixaDistribuicaoFogueirasBackendDto,
  JogoDetalhesBackendDto,
  JogoResumoBackendDto,
  PostBackendDto,
  RegistroJogoUsuarioBackendDto,
  VitrineHomeBackendDto,
} from '@shared/api';
import { decodificarPayloadToken } from '@shared/lib';
import {
  TODOS_OS_JOGOS_MOCK,
  type FaixaDistribuicaoNota,
} from './mockVitrine';
import type {
  ComentarioReview,
  JogoResumo,
  RegistroJogoUsuario,
  RespostaVitrineHome,
  ReviewComunidade,
  SecaoVitrine,
  StatusBiblioteca,
} from './tipos';

export const MAPA_SLUG_PARA_STEAM_APP_ID: Record<string, number> = {
  'elden-ring': 1245620,
  'baldurs-gate-3': 1086940,
  'clair-obscur-33': 1903340,
  'hollow-knight': 367520,
  'red-dead-2': 1174180,
  hades: 1145360,
  sekiro: 814380,
  'the-witcher-3': 292030,
  'cyberpunk-2077': 1091500,
  'lies-of-p': 1627720,
  'dark-souls-3': 374320,
  celeste: 504230,
  'stardew-valley': 413150,
  'outer-wilds': 753640,
  'resident-evil-4': 2050650,
  'silent-hill-2': 2124490,
  'it-takes-two': 1426210,
  'helldivers-2': 553850,
  'split-fiction': 2001120,
  'persona-5-royal': 1687950,
};

export const MAPA_STEAM_APP_ID_PARA_SLUG: Record<number, string> = Object.fromEntries(
  Object.entries(MAPA_SLUG_PARA_STEAM_APP_ID).map(([slug, appId]) => [appId, slug])
);

const PALETAS_FOGUEIRA: ReadonlyArray<{
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  emblema: JogoResumo['emblema'];
}> = [
  { corPrimaria: '#1c1917', corSecundaria: '#78350f', corAcento: '#fbbf24', emblema: 'fogo' },
  { corPrimaria: '#1e1b4b', corSecundaria: '#7c2d12', corAcento: '#f59e0b', emblema: 'coroa' },
  { corPrimaria: '#090d16', corSecundaria: '#1e3a5f', corAcento: '#93c5fd', emblema: 'lua' },
  { corPrimaria: '#1f0a0a', corSecundaria: '#b91c1c', corAcento: '#facc15', emblema: 'espada' },
  { corPrimaria: '#0f172a', corSecundaria: '#334155', corAcento: '#fb923c', emblema: 'escudo' },
  { corPrimaria: '#052e16', corSecundaria: '#15803d', corAcento: '#fde047', emblema: 'estrela' },
  { corPrimaria: '#172554', corSecundaria: '#0284c7', corAcento: '#38bdf8', emblema: 'controle' },
  { corPrimaria: '#111827', corSecundaria: '#7f1d1d', corAcento: '#fca5a5', emblema: 'caveira' },
];

const MAPA_GENERO_BACKEND: Record<string, { label: string; slug: string }> = {
  Rpg: { label: 'RPG', slug: 'rpg' },
  Acao: { label: 'Ação', slug: 'acao' },
  Aventura: { label: 'Aventura', slug: 'aventura' },
  Indie: { label: 'Indie', slug: 'indie' },
  Estrategia: { label: 'Estratégia', slug: 'estrategia' },
  Simulacao: { label: 'Simulação', slug: 'simulacao' },
  Corrida: { label: 'Corrida', slug: 'corrida' },
  Esportes: { label: 'Esportes', slug: 'esportes' },
  Casual: { label: 'Casual', slug: 'casual' },
  MassivoMultiplayer: { label: 'MMO & Co-op', slug: 'coop' },
  GratuitoParaJogar: { label: 'Gratuito', slug: 'gratuito' },
  AcessoAntecipado: { label: 'Acesso Antecipado', slug: 'acesso-antecipado' },
};

export const EVENTO_CATALOGO_ATUALIZADO = 'checkpoint:catalogo-atualizado';

const cacheJogosDinamicos = new Map<string, JogoResumo>();
const cacheDistribuicoesJogos = new Map<string, FaixaDistribuicaoNota[]>();

const inicializarCacheComMocks = () => {
  for (const mock of TODOS_OS_JOGOS_MOCK) {
    const steamAppId = MAPA_SLUG_PARA_STEAM_APP_ID[mock.id];
    const enriquecido: JogoResumo = steamAppId ? { ...mock, steamAppId } : mock;
    cacheJogosDinamicos.set(mock.id, enriquecido);
    if (steamAppId) {
      cacheJogosDinamicos.set(String(steamAppId), enriquecido);
    }
  }
};

inicializarCacheComMocks();

const notificarCatalogoAtualizado = () => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(EVENTO_CATALOGO_ATUALIZADO));
  }
};

export const resetarCacheCatalogoDinamico = (): void => {
  cacheJogosDinamicos.clear();
  cacheDistribuicoesJogos.clear();
  inicializarCacheComMocks();
};

export const obterIdCanonicoJogo = (steamAppId: number): string =>
  MAPA_STEAM_APP_ID_PARA_SLUG[steamAppId] ?? String(steamAppId);

export const resolverSteamAppIdDeJogoId = (idOuSlug: string): number | null => {
  const limpo = idOuSlug.trim();
  if (!limpo) return null;
  if (/^\d+$/.test(limpo)) {
    const numero = Number(limpo);
    return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
  }
  if (MAPA_SLUG_PARA_STEAM_APP_ID[limpo]) {
    return MAPA_SLUG_PARA_STEAM_APP_ID[limpo];
  }
  const doCache = cacheJogosDinamicos.get(limpo);
  return doCache?.steamAppId ?? null;
};

export const registrarJogoNoCache = (jogo: JogoResumo): JogoResumo => {
  cacheJogosDinamicos.set(jogo.id, jogo);
  if (jogo.steamAppId) {
    cacheJogosDinamicos.set(String(jogo.steamAppId), jogo);
  }
  return jogo;
};

export const atualizarMetricasJogoNoCache = (
  jogoIdOuSteamId: string | number,
  notaMedia: number,
  totalAvaliacoes: number,
  distribuicao?: FaixaDistribuicaoFogueirasBackendDto[]
): void => {
  const chave =
    typeof jogoIdOuSteamId === 'number'
      ? obterIdCanonicoJogo(jogoIdOuSteamId)
      : jogoIdOuSteamId;

  const existente = cacheJogosDinamicos.get(chave);
  if (existente) {
    const atualizado: JogoResumo = {
      ...existente,
      notaMedia,
      totalAvaliacoes,
    };
    registrarJogoNoCache(atualizado);
  }

  if (distribuicao && distribuicao.length > 0 && totalAvaliacoes > 0) {
    cacheDistribuicoesJogos.set(
      chave,
      adaptarDistribuicaoBackend(distribuicao, notaMedia, totalAvaliacoes)
    );
  } else if (totalAvaliacoes <= 0) {
    cacheDistribuicoesJogos.delete(chave);
  }

  notificarCatalogoAtualizado();
};

export const buscarJogoNoCatalogo = (idOuSlug: string): JogoResumo | undefined => {
  const direto = cacheJogosDinamicos.get(idOuSlug);
  if (direto) return direto;

  const steamId = resolverSteamAppIdDeJogoId(idOuSlug);
  if (steamId) {
    return cacheJogosDinamicos.get(obterIdCanonicoJogo(steamId));
  }

  return undefined;
};

export const listarTodosJogosConhecidos = (): JogoResumo[] => {
  const unicos = new Map<string, JogoResumo>();
  for (const jogo of cacheJogosDinamicos.values()) {
    unicos.set(jogo.id, jogo);
  }
  return Array.from(unicos.values());
};

export const obterDistribuicaoConhecidaJogo = (jogo: JogoResumo): FaixaDistribuicaoNota[] => {
  const salva = cacheDistribuicoesJogos.get(jogo.id);
  if (salva && jogo.totalAvaliacoes > 0) return salva;
  return [
    { estrelas: 5, percentual: 0 },
    { estrelas: 4, percentual: 0 },
    { estrelas: 3, percentual: 0 },
    { estrelas: 2, percentual: 0 },
    { estrelas: 1, percentual: 0 },
  ];
};

export const obterPaletaJogo = (steamAppId: number) => {
  const slugCurado = MAPA_STEAM_APP_ID_PARA_SLUG[steamAppId];
  if (slugCurado) {
    const mock = TODOS_OS_JOGOS_MOCK.find((j) => j.id === slugCurado);
    if (mock) {
      return {
        corPrimaria: mock.corPrimaria,
        corSecundaria: mock.corSecundaria,
        corAcento: mock.corAcento,
        emblema: mock.emblema,
      };
    }
  }
  const indice = Math.abs(steamAppId) % PALETAS_FOGUEIRA.length;
  return PALETAS_FOGUEIRA[indice];
};

const normalizarGeneros = (generosBrutos: string[]) => {
  const nomes: string[] = [];
  const slugs: string[] = [];

  for (const g of generosBrutos) {
    const mapeado = MAPA_GENERO_BACKEND[g];
    if (mapeado) {
      if (!nomes.includes(mapeado.label)) nomes.push(mapeado.label);
      if (!slugs.includes(mapeado.slug)) slugs.push(mapeado.slug);
    } else if (g.trim()) {
      nomes.push(g.trim());
      slugs.push(g.trim().toLowerCase());
    }
  }

  return {
    nomes: nomes.length > 0 ? nomes : ['Jogo'],
    slugs: slugs.length > 0 ? slugs : ['acao'],
  };
};

const normalizarStatus = (status?: string | null): StatusBiblioteca | undefined => {
  if (!status) return undefined;
  const valor = status.trim().toLowerCase();
  if (
    valor === 'zerado' ||
    valor === 'jogando' ||
    valor === 'quero_jogar' ||
    valor === 'abandonado'
  ) {
    return valor;
  }
  return undefined;
};

export const adaptarJogoResumoBackend = (dto: JogoResumoBackendDto): JogoResumo => {
  const idCanonico = obterIdCanonicoJogo(dto.steamAppId);
  const existenteCurado = TODOS_OS_JOGOS_MOCK.find((j) => j.id === idCanonico);
  const paleta = obterPaletaJogo(dto.steamAppId);
  const generosConvertidos = normalizarGeneros(dto.generos);

  const badge =
    dto.percentualDesconto > 0
      ? `-${dto.percentualDesconto}% na Steam`
      : dto.gratuito
        ? 'Gratuito'
        : existenteCurado?.badge;

  const jogo: JogoResumo = {
    id: idCanonico,
    steamAppId: dto.steamAppId,
    titulo: dto.nome,
    ano: dto.anoLancamento ?? existenteCurado?.ano ?? new Date().getFullYear(),
    notaMedia: typeof dto.mediaFogueiras === 'number' ? dto.mediaFogueiras : 0,
    totalAvaliacoes: typeof dto.totalAvaliacoes === 'number' ? dto.totalAvaliacoes : 0,
    generos:
      generosConvertidos.nomes.length > 0
        ? generosConvertidos.nomes
        : (existenteCurado?.generos ?? ['Ação']),
    generosSlugs: Array.from(
      new Set([...generosConvertidos.slugs, ...(existenteCurado?.generosSlugs ?? [])])
    ),
    desenvolvedora: dto.desenvolvedora || existenteCurado?.desenvolvedora || 'Steam',
    plataformaPrincipal: 'Steam',
    sinopseCurta:
      dto.descricao?.trim() ||
      existenteCurado?.sinopseCurta ||
      `Explore ${dto.nome} e registre sua jornada na Fogueira.`,
    capaUrl: dto.imagem || existenteCurado?.capaUrl,
    bannerUrl: dto.imagem || existenteCurado?.bannerUrl,
    corPrimaria: paleta.corPrimaria,
    corSecundaria: paleta.corSecundaria,
    corAcento: paleta.corAcento,
    emblema: paleta.emblema,
    badge,
  };

  return registrarJogoNoCache(jogo);
};

export const adaptarDistribuicaoBackend = (
  faixas: FaixaDistribuicaoFogueirasBackendDto[],
  _notaMedia: number,
  totalAvaliacoes: number
): FaixaDistribuicaoNota[] => {
  if (!faixas || faixas.length === 0 || totalAvaliacoes <= 0) {
    return [
      { estrelas: 5, percentual: 0 },
      { estrelas: 4, percentual: 0 },
      { estrelas: 3, percentual: 0 },
      { estrelas: 2, percentual: 0 },
      { estrelas: 1, percentual: 0 },
    ];
  }

  return ([5, 4, 3, 2, 1] as const).map((estrelas) => {
    const encontrada = faixas.find((f) => f.estrelas === estrelas);
    return {
      estrelas,
      percentual: encontrada?.percentual ?? 0,
    };
  });
};

export const adaptarDetalhesJogoBackend = (dto: JogoDetalhesBackendDto): {
  jogo: JogoResumo;
  distribuicao: FaixaDistribuicaoNota[];
  relacionados: JogoResumo[];
} => {
  const jogo = adaptarJogoResumoBackend({
    idJogo: dto.idJogo,
    steamAppId: dto.steamAppId,
    nome: dto.nome,
    descricao: dto.descricao,
    imagem: dto.imagem,
    desenvolvedora: dto.desenvolvedora,
    publicadora: dto.publicadora,
    anoLancamento: dto.anoLancamento,
    notaMetacritic: dto.notaMetacritic,
    gratuito: dto.gratuito,
    emBreve: dto.emBreve,
    precoOriginalCentavos: dto.precoOriginalCentavos,
    precoFinalCentavos: dto.precoFinalCentavos,
    percentualDesconto: dto.percentualDesconto,
    pontuacaoCuradoria: 0,
    mediaFogueiras: dto.mediaFogueiras,
    totalAvaliacoes: dto.totalAvaliacoes,
    generos: dto.generos,
  });

  const distribuicao = adaptarDistribuicaoBackend(
    dto.distribuicaoFogueiras,
    dto.mediaFogueiras,
    dto.totalAvaliacoes
  );
  cacheDistribuicoesJogos.set(jogo.id, distribuicao);

  const relacionados = (dto.jogosRelacionados ?? []).map(adaptarJogoResumoBackend);
  return { jogo, distribuicao, relacionados };
};

const pertenceAoUsuarioLogado = (idUsuario: number, doUsuarioDto: boolean): boolean => {
  if (doUsuarioDto) return true;
  const payload = decodificarPayloadToken();
  const idToken = payload?.sub ?? payload?.nameid;
  return Boolean(idToken && String(idUsuario) === String(idToken));
};

export const adaptarPostBackend = (dto: PostBackendDto): ReviewComunidade => {
  const jogoId = obterIdCanonicoJogo(dto.steamAppId);
  const paleta = obterPaletaJogo(dto.steamAppId);

  return {
    id: String(dto.idPost),
    idPostBackend: dto.idPost,
    autorNome: dto.autorNome,
    autorHandle: dto.autorHandle,
    autorIniciais: dto.autorIniciais,
    autorFotoPerfil: dto.autorFotoPerfil ?? undefined,
    jogoId,
    steamAppId: dto.steamAppId,
    jogoTitulo: dto.jogoTitulo,
    jogoAno: dto.jogoAno,
    jogoCorPrimaria: paleta.corPrimaria,
    jogoCorSecundaria: paleta.corSecundaria,
    jogoCorAcento: paleta.corAcento,
    jogoCapaUrl: dto.jogoCapaUrl || undefined,
    nota: dto.nota,
    comentario: dto.comentario,
    curtidas: dto.curtidas,
    totalComentarios: dto.totalComentarios,
    curtidaPeloUsuario: dto.curtidaPeloUsuario,
    tempoAtras: dto.tempoAtras,
    status: normalizarStatus(dto.status),
    tags: dto.tags && dto.tags.length > 0 ? dto.tags : undefined,
    contemSpoiler: dto.contemSpoiler,
    doUsuarioAtual: pertenceAoUsuarioLogado(dto.idUsuario, dto.doUsuarioAtual),
  };
};

export const adaptarComentarioBackend = (dto: ComentarioBackendDto): ComentarioReview => ({
  id: String(dto.idComentario),
  idComentarioBackend: dto.idComentario,
  reviewId: String(dto.idPost),
  autorNome: dto.autorNome,
  autorHandle: dto.autorHandle,
  autorIniciais: dto.autorIniciais,
  autorFotoPerfil: dto.autorFotoPerfil ?? undefined,
  texto: dto.texto,
  curtidas: dto.curtidas,
  curtidaPeloUsuario: dto.curtidaPeloUsuario,
  tempoAtras: dto.tempoAtras,
  contemSpoiler: dto.contemSpoiler,
  doUsuarioAtual: pertenceAoUsuarioLogado(dto.idUsuario, dto.doUsuarioAtual),
});

export const adaptarRegistroDiarioBackend = (
  dto: RegistroJogoUsuarioBackendDto
): {
  jogoId: string;
  registro: RegistroJogoUsuario;
  jogo: JogoResumo;
} => {
  const jogo = adaptarJogoResumoBackend({
    idJogo: dto.idJogo,
    steamAppId: dto.steamAppId,
    nome: dto.jogoTitulo,
    descricao: '',
    imagem: dto.jogoCapaUrl,
    desenvolvedora: dto.desenvolvedora,
    publicadora: dto.desenvolvedora,
    anoLancamento: dto.jogoAno,
    gratuito: false,
    emBreve: false,
    percentualDesconto: 0,
    pontuacaoCuradoria: 0,
    mediaFogueiras: dto.notaMediaJogo,
    totalAvaliacoes: dto.totalAvaliacoesJogo,
    generos: dto.generos,
  });

  const registro: RegistroJogoUsuario = {
    jogoId: jogo.id,
    steamAppId: dto.steamAppId,
    status: normalizarStatus(dto.status),
    jogado: dto.jogado,
    queroJogar: dto.queroJogar,
    favorito: dto.favorito,
    nota: typeof dto.nota === 'number' ? dto.nota : undefined,
    tags: dto.tags && dto.tags.length > 0 ? dto.tags : undefined,
    idPostReview: dto.idPostReview ?? undefined,
    comentario: dto.comentario ?? undefined,
    contemSpoiler: dto.contemSpoiler,
    atualizadoEm: dto.atualizadoEm,
  };

  return { jogoId: jogo.id, registro, jogo };
};

export const adaptarVitrineHomeBackend = (
  dto: VitrineHomeBackendDto
): RespostaVitrineHome => {
  const destaques = dto.destaques.map(adaptarJogoResumoBackend);
  const secoes: SecaoVitrine[] = dto.secoes.map((s) => {
    if (s.tipo === 'REVIEWS') {
      return {
        id: s.id,
        titulo: s.titulo,
        subtitulo: s.subtitulo ?? undefined,
        tipo: 'REVIEWS',
        itens: s.reviews.map(adaptarPostBackend),
      };
    }

    return {
      id: s.id,
      titulo: s.titulo,
      subtitulo: s.subtitulo ?? undefined,
      tipo: s.tipo === 'TOP_10' ? 'TOP_10' : 'JOGOS',
      filtroGenero: s.filtroGenero ?? undefined,
      itens: s.jogos.map(adaptarJogoResumoBackend),
    };
  });

  return {
    destaques,
    generosDisponiveis: dto.generosDisponiveis,
    secoes,
  };
};
