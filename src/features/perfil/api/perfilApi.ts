import { clienteApi, ENDPOINTS_API } from '@shared/api';
import { decodificarPayloadToken } from '@shared/lib';
import type { EstantesUsuario, PerfilUsuario, JogoResumo } from '../model/tipos';

const JOGOS_MOCK_FAVORITOS: JogoResumo[] = [
  {
    steamAppId: 1245620,
    nome: 'Elden Ring',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg',
    generoPrincipal: 'RPG de Ação / Soulslike',
    anoLancamento: 2022,
    notaMetacritic: 96,
    avaliacaoUsuario: 5,
    dataRegistro: '2026-11-20',
  },
  {
    steamAppId: 292030,
    nome: 'The Witcher 3: Wild Hunt',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg',
    generoPrincipal: 'RPG / Mundo Aberto',
    anoLancamento: 2015,
    notaMetacritic: 93,
    avaliacaoUsuario: 5,
    dataRegistro: '2026-11-15',
  },
  {
    steamAppId: 1086940,
    nome: "Baldur's Gate 3",
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg',
    generoPrincipal: 'RPG Tático / Fantasia',
    anoLancamento: 2023,
    notaMetacritic: 96,
    avaliacaoUsuario: 5,
    dataRegistro: '2026-11-10',
  },
  {
    steamAppId: 367520,
    nome: 'Hollow Knight',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg',
    generoPrincipal: 'Metroidvania / Soulslike',
    anoLancamento: 2017,
    notaMetacritic: 90,
    avaliacaoUsuario: 4.5,
    dataRegistro: '2026-11-05',
  },
];

const JOGOS_MOCK_ATIVIDADE: JogoResumo[] = [
  {
    steamAppId: 1091500,
    nome: 'Cyberpunk 2077',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg',
    generoPrincipal: 'RPG / Cyberpunk',
    anoLancamento: 2020,
    notaMetacritic: 86,
    avaliacaoUsuario: 4,
    dataRegistro: 'Ontem às 21:40',
  },
  {
    steamAppId: 1174180,
    nome: 'Red Dead Redemption 2',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg',
    generoPrincipal: 'Ação / Western',
    anoLancamento: 2019,
    notaMetacritic: 97,
    avaliacaoUsuario: 5,
    dataRegistro: '24 de nov, 2026',
  },
  {
    steamAppId: 374320,
    nome: 'DARK SOULS™ III',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900.jpg',
    generoPrincipal: 'Ação / Soulslike',
    anoLancamento: 2016,
    notaMetacritic: 89,
    avaliacaoUsuario: 4.5,
    dataRegistro: '22 de nov, 2026',
  },
  {
    steamAppId: 814380,
    nome: 'Sekiro™: Shadows Die Twice',
    imagemCapaUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg',
    generoPrincipal: 'Ação / Furtividade',
    anoLancamento: 2019,
    notaMetacritic: 90,
    avaliacaoUsuario: 5,
    dataRegistro: '19 de nov, 2026',
  },
];

export async function obterEstantesUsuarioAsync(): Promise<EstantesUsuario> {
  return await clienteApi<EstantesUsuario>(ENDPOINTS_API.ESTANTES.MINHAS);
}

export async function obterPerfilCompletoAsync(): Promise<PerfilUsuario> {
  const payload = decodificarPayloadToken();
  const email = payload?.email || 'jogador@checkpoint.com';
  const nomePadrao = email.split('@')[0] || 'Lucas Pereira';

  let estantesBackend: EstantesUsuario | null = null;
  try {
    estantesBackend = await obterEstantesUsuarioAsync();
  } catch {
    estantesBackend = null;
  }

  const favoritos = (estantesBackend?.favoritos.jogos && estantesBackend.favoritos.jogos.length > 0)
    ? estantesBackend.favoritos.jogos
    : JOGOS_MOCK_FAVORITOS;

  const pretendeJogar = estantesBackend?.pretendeJogar.jogos || [];

  return {
    id: payload?.id ? Number(payload.id) : 1,
    nome: nomePadrao,
    email: email,
    fotoPerfil: null,
    biografiaGamer: 'Entusiasta de RPGs, mundos imersivos e narrativas épicas. Sempre em busca do próximo 100% no Checkpoint.',
    nivelGamer: 14,
    pontosExperiencia: 2850,
    quantidadeSeguidores: 42,
    quantidadeSeguindo: 19,
    totalJogos: favoritos.length + pretendeJogar.length + 18,
    jogosFinalizadosAno: 11,
    tipoPerfil: 'Regular',
    favoritos: favoritos,
    atividadeRecente: JOGOS_MOCK_ATIVIDADE,
    distribuicaoNotas: {
      1: 1,
      2: 3,
      3: 8,
      4: 21,
      5: 14,
    },
  };
}
