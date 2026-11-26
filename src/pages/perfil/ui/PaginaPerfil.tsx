import React, { useEffect, useState } from 'react';
import {
  CabecalhoPerfil,
  JogosFavoritosGrid,
  AtividadeRecente,
  HistogramaNotas,
  ModalEditarPerfil,
  obterPerfilCompletoAsync,
  type PerfilUsuario,
} from '@features/perfil';

type AbaPerfil = 'perfil' | 'atividade' | 'jogos' | 'diario' | 'avaliacoes' | 'pretendeJogar' | 'listas';

export const PaginaPerfil: React.FC = () => {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>('perfil');
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);

  useEffect(() => {
    let montado = true;
    obterPerfilCompletoAsync()
      .then((dados) => {
        if (montado) {
          setPerfil(dados);
          setCarregando(false);
        }
      })
      .catch(() => {
        if (montado) setCarregando(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  const lidarComAtualizarPerfil = (novosDados: Partial<PerfilUsuario>) => {
    if (!perfil) return;
    setPerfil({
      ...perfil,
      ...novosDados,
    });
  };

  if (carregando) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-fire-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-night-300">
          Carregando perfil do jogador...
        </span>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-night-400">Não foi possível carregar os dados do perfil.</p>
      </div>
    );
  }

  const abasNavegacao: { id: AbaPerfil; label: string }[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'atividade', label: 'Atividade' },
    { id: 'jogos', label: 'Jogos' },
    { id: 'diario', label: 'Diário' },
    { id: 'avaliacoes', label: 'Avaliações' },
    { id: 'pretendeJogar', label: 'Pretende Jogar' },
    { id: 'listas', label: 'Listas' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-8 animate-fade-in">
      {/* 1. Cabeçalho Principal do Gamer */}
      <CabecalhoPerfil
        perfil={perfil}
        aoAbrirEdicao={() => setModalEdicaoAberto(true)}
      />

      {/* 2. Sub-navegação interna estilo Letterboxd */}
      <nav className="flex items-center gap-1 sm:gap-2 border-b border-night-800 pb-px overflow-x-auto text-xs sm:text-sm font-bold tracking-wide">
        {abasNavegacao.map((aba) => {
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              type="button"
              className={`px-3 sm:px-4 py-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                ativa
                  ? 'border-fire-500 text-white font-extrabold'
                  : 'border-transparent text-night-400 hover:text-night-200 hover:border-night-700'
              }`}
            >
              {aba.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Conteúdo da Aba Perfil */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal da Esquerda (8 colunas) */}
        <div className="lg:col-span-8 space-y-9">
          {/* Jogos Favoritos (Os 4 slots de destaque) */}
          <JogosFavoritosGrid
            jogos={perfil.favoritos}
            aoAdicionarFavorito={() => setModalEdicaoAberto(true)}
          />

          {/* Atividade Recente */}
          <AtividadeRecente jogos={perfil.atividadeRecente} />

          {/* Destaque de Avaliação Recente (Review Card estilo Letterboxd) */}
          <div className="w-full bg-night-950/40 border border-night-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-night-800 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-night-400">
                Última Análise Publicada
              </h2>
              <span className="text-xs text-night-400">Há 2 dias</span>
            </div>

            <div className="flex gap-4">
              <div className="w-20 shrink-0 aspect-[2/3] rounded overflow-hidden bg-night-800 border border-night-700">
                <img
                  src={perfil.favoritos[0]?.imagemCapaUrl || 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg'}
                  alt="Destaque"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {perfil.favoritos[0]?.nome || 'Elden Ring'}
                  </h4>
                  <div className="text-ember-400 text-sm mt-0.5">★★★★★</div>
                  <p className="mt-2 text-xs sm:text-sm text-night-200 line-clamp-3 leading-relaxed">
                    &ldquo;Uma obra-prima do design de mundo aberto. A sensação de descoberta nas Terras Intermédias é incomparável. Cada recanto do mapa recompensa a curiosidade do jogador.&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-night-400">
                  <span className="text-fire-400 font-semibold">🔥 24 fogueiras</span>
                  <span>•</span>
                  <span>6 comentários</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral da Direita (4 colunas) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Histograma de Notas */}
          <HistogramaNotas distribuicao={perfil.distribuicaoNotas} />

          {/* Widget Pretende Jogar (Backlog) */}
          <div className="w-full bg-night-950/60 p-4 rounded-xl border border-night-800">
            <div className="flex items-center justify-between mb-3 border-b border-night-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-night-400">
                Pretende Jogar
              </h3>
              <span className="text-[11px] font-semibold text-ember-400 hover:text-ember-300 cursor-pointer">
                Ver Fila
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-night-900/60 border border-night-800/80 hover:border-night-700 transition-colors">
                <img
                  src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg"
                  alt="Baldur's Gate"
                  className="w-16 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Baldur's Gate 3</p>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    -20% na Steam
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-night-900/60 border border-night-800/80 hover:border-night-700 transition-colors">
                <img
                  src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg"
                  alt="Shadow of the Erdtree"
                  className="w-16 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Shadow of the Erdtree</p>
                  <span className="text-[10px] text-night-400 font-medium">Prioridade Alta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diário Gamer Recente */}
          <div className="w-full bg-night-950/60 p-4 rounded-xl border border-night-800">
            <div className="flex items-center justify-between mb-3 border-b border-night-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-night-400">
                Diário Gamer
              </h3>
              <span className="text-[11px] font-semibold text-night-400">2026</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-night-200">
                <span className="font-semibold text-white truncate max-w-[180px]">
                  Cyberpunk 2077
                </span>
                <span className="text-night-400 text-[11px]">25 Nov • 4★</span>
              </div>
              <div className="flex items-center justify-between text-night-200">
                <span className="font-semibold text-white truncate max-w-[180px]">
                  Red Dead Redemption 2
                </span>
                <span className="text-night-400 text-[11px]">20 Nov • 5★</span>
              </div>
              <div className="flex items-center justify-between text-night-200">
                <span className="font-semibold text-white truncate max-w-[180px]">
                  Hollow Knight
                </span>
                <span className="text-night-400 text-[11px]">14 Nov • 4.5★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Editar Perfil */}
      <ModalEditarPerfil
        aberto={modalEdicaoAberto}
        perfil={perfil}
        aoFechar={() => setModalEdicaoAberto(false)}
        aoSalvar={lidarComAtualizarPerfil}
      />
    </div>
  );
};
