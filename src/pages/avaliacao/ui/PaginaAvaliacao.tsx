import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  adaptarDetalhesJogoBackend,
  buscarJogoNoCatalogo,
  resolverSteamAppIdDeJogoId,
  useBibliotecaFogueira,
  type JogoResumo,
  type StatusBiblioteca,
} from '@entities/index';
import { catalogoApi } from '@shared/api';
import { ROTAS, rotaJogo } from '@shared/config';
import { cn } from '@shared/lib';
import { Botao, IconeChamaNota } from '@shared/ui';
import { CapaJogoEstilizada } from '@widgets/index';
import { obterDescricaoNota } from '@widgets/vitrine/ui/ModalAvaliacaoRapida';

const OPCOES_STATUS: { valor: StatusBiblioteca; label: string; descricao: string }[] = [
  { valor: 'zerado', label: 'Zerado', descricao: 'Finalizei a campanha' },
  { valor: 'jogando', label: 'Jogando', descricao: 'Estou jogando agora' },
  { valor: 'quero_jogar', label: 'Quero jogar', descricao: 'Na fila para começar' },
  { valor: 'abandonado', label: 'Pausado', descricao: 'Deixei para depois' },
];

const DESTAQUES_SUGERIDOS = [
  'História marcante',
  'Trilha sonora',
  'Gameplay viciante',
  'Direção de arte',
  'Desafiador',
  'Rejogável',
];

const ESCALA_CHAMAS: Record<
  number,
  { tamanho: string; brilho: string; atraso: string }
> = {
  1: { tamanho: 'h-7 w-7 sm:h-8 sm:w-8', brilho: 'drop-shadow(0 0 6px rgba(234,88,12,0.55))', atraso: '0s' },
  2: { tamanho: 'h-8 w-8 sm:h-9 sm:w-9', brilho: 'drop-shadow(0 0 9px rgba(255,107,43,0.65))', atraso: '0.18s' },
  3: { tamanho: 'h-10 w-10 sm:h-11 sm:w-11', brilho: 'drop-shadow(0 0 12px rgba(255,140,66,0.72))', atraso: '0.35s' },
  4: { tamanho: 'h-12 w-12 sm:h-[52px] sm:w-[52px]', brilho: 'drop-shadow(0 0 16px rgba(255,184,48,0.8))', atraso: '0.12s' },
  5: { tamanho: 'h-14 w-14 sm:h-[62px] sm:w-[62px]', brilho: 'drop-shadow(0 0 22px rgba(255,209,102,0.92))', atraso: '0.26s' },
};

const CAMINHO_CHAMA_EXTERNA =
  'M12.2 2C12.8 5.8 9.9 7.8 9.6 10.6C8.5 9.8 7.9 8.5 8 7.2C5.5 9.2 4.2 12.1 4.2 14.8C4.2 19 7.6 22 12 22C16.4 22 19.8 18.8 19.8 14.4C19.8 10.2 16.9 6.6 14.8 4.4C14.7 6.3 13.7 7.6 12.7 8.4C13.6 6.1 13.4 3.8 12.2 2Z';

const CAMINHO_CHAMA_INTERNA =
  'M12.1 10.8C12.3 12.7 10.8 13.8 10.8 15.6C10.8 17.5 11.7 18.9 12.6 19.2C14.4 18.8 15.7 17.1 15.7 15.1C15.7 13.1 14.1 11.6 12.1 10.8Z';

const ChamaSvg: React.FC<{
  nivel: number;
  preenchimento: 'cheia' | 'meia' | 'vazia';
  uid: string;
}> = ({ nivel, preenchimento, uid }) => {
  const cfg = ESCALA_CHAMAS[nivel] ?? ESCALA_CHAMAS[3];
  const acesa = preenchimento !== 'vazia';
  const idGradExterno = `chama-ext-${uid}`;
  const idGradInterno = `chama-int-${uid}`;
  const idClipMeia = `chama-meia-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        cfg.tamanho,
        'transition-all duration-300',
        acesa && 'animar-chama-nota'
      )}
      style={{
        filter: acesa ? cfg.brilho : 'none',
        animationDelay: acesa ? cfg.atraso : undefined,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={idGradExterno} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="42%" stopColor="#ff6b2b" />
          <stop offset="78%" stopColor="#ffb830" />
          <stop offset="100%" stopColor="#ffe58f" />
        </linearGradient>
        <linearGradient id={idGradInterno} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#ff8c42" />
          <stop offset="55%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#fffbeb" />
        </linearGradient>
        <clipPath id={idClipMeia}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>

      {/* Silhueta apagada (base) */}
      <path
        d={CAMINHO_CHAMA_EXTERNA}
        fill="#131f33"
        stroke={acesa ? 'transparent' : '#2a3f63'}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Chama acesa (inteira ou metade esquerda) */}
      {acesa && (
        <g clipPath={preenchimento === 'meia' ? `url(#${idClipMeia})` : undefined}>
          <path d={CAMINHO_CHAMA_EXTERNA} fill={`url(#${idGradExterno})`} />
          <path d={CAMINHO_CHAMA_INTERNA} fill={`url(#${idGradInterno})`} opacity="0.92" />
        </g>
      )}
    </svg>
  );
};

export const PaginaAvaliacao: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const [jogo, setJogo] = useState<JogoResumo | undefined>(() => buscarJogoNoCatalogo(id));

  const { registros, salvarAvaliacao } = useBibliotecaFogueira();
  const registroAtual = jogo ? registros[jogo.id] : undefined;

  const [status, setStatus] = useState<StatusBiblioteca>(registroAtual?.status ?? 'zerado');
  const [nota, setNota] = useState<number>(registroAtual?.nota ?? 5);
  const [notaHover, setNotaHover] = useState<number | null>(null);
  const [favorito, setFavorito] = useState<boolean>(Boolean(registroAtual?.favorito));
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(registroAtual?.tags ?? []);
  const [comentario, setComentario] = useState<string>(registroAtual?.comentario ?? '');
  const [contemSpoiler, setContemSpoiler] = useState<boolean>(
    Boolean(registroAtual?.contemSpoiler)
  );

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    } catch {
      // Ambiente de teste sem suporte a scrollTo
    }
  }, [id]);

  useEffect(() => {
    const local = buscarJogoNoCatalogo(id);
    setJogo(local);

    const steamAppId = resolverSteamAppIdDeJogoId(id);
    if (!local && steamAppId) {
      let ativo = true;
      catalogoApi
        .obterDetalhesPorSteamAppId(steamAppId)
        .then((dto) => {
          if (ativo) setJogo(adaptarDetalhesJogoBackend(dto).jogo);
        })
        .catch(() => {
          // Mantém estado local
        });
      return () => {
        ativo = false;
      };
    }
  }, [id]);

  useEffect(() => {
    const chave = jogo?.id ?? id;
    const reg = registros[chave];
    if (!reg) return;
    setStatus(reg.status ?? 'zerado');
    setNota(reg.nota ?? 5);
    setFavorito(Boolean(reg.favorito));
    setTagsSelecionadas(reg.tags ?? []);
    setComentario(reg.comentario ?? '');
    setContemSpoiler(Boolean(reg.contemSpoiler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, jogo?.id]);

  if (!jogo) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-400">
          Checkpoint · Avaliação
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Jogo não encontrado
        </h1>
        <p className="text-sm sm:text-base text-night-300">
          Não encontramos esse título para avaliar. Volte para a vitrine e escolha um jogo.
        </p>
        <div className="pt-2">
          <Link to={ROTAS.INICIO}>
            <Botao variante="primario" tamanho="medio">
              Voltar para a Fogueira
            </Botao>
          </Link>
        </div>
      </section>
    );
  }

  const notaExibida = notaHover ?? nota;

  const alternarTag = (tag: string) => {
    setTagsSelecionadas((atual) =>
      atual.includes(tag) ? atual.filter((item) => item !== tag) : [...atual, tag]
    );
  };

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    salvarAvaliacao({
      jogo,
      nota,
      status,
      comentario: comentario.trim(),
      tags: tagsSelecionadas,
      contemSpoiler,
      favorito,
    });
    navegar(rotaJogo(jogo.id));
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden pb-20">
      {/* Atmosfera de fundo com a paleta do jogo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background: `radial-gradient(circle at 72% 15%, ${jogo.corSecundaria} 0%, #0b1320 62%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-[14%] h-96 w-96 rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: jogo.corAcento }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 pt-8 sm:pt-12 space-y-8">
        {/* Topo com breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Navegação da avaliação" className="flex items-center gap-2 text-xs">
            <Link
              to={ROTAS.INICIO}
              className="text-night-400 hover:text-white transition-colors"
            >
              Início
            </Link>
            <span className="text-night-600">/</span>
            <Link
              to={rotaJogo(jogo.id)}
              className="text-night-400 hover:text-white transition-colors"
            >
              {jogo.titulo}
            </Link>
            <span className="text-night-600">/</span>
            <span className="font-semibold text-ember-300">Avaliar</span>
          </nav>

          <Link
            to={rotaJogo(jogo.id)}
            className="text-xs font-semibold text-night-300 hover:text-white transition-colors"
          >
            Ver página do jogo →
          </Link>
        </div>

        {/* Layout principal em 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
          {/* Coluna esquerda: Capa e resumo do jogo */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="max-w-[240px] lg:max-w-none aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.85)]">
              <CapaJogoEstilizada jogo={jogo} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-fire-400">
                {jogo.desenvolvedora} · {jogo.ano}
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                {jogo.titulo}
              </h1>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {jogo.generos.map((genero) => (
                  <span
                    key={genero}
                    className="rounded-md border border-night-700/80 bg-night-800/80 px-2 py-0.5 text-[11px] font-medium text-night-300"
                  >
                    {genero}
                  </span>
                ))}
              </div>
              <p className="text-xs text-night-400 pt-1 flex items-center gap-1.5">
                <span>Média da comunidade:</span>
                {jogo.notaMedia > 0 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-ember-400">
                    <IconeChamaNota tamanho={14} />
                    {jogo.notaMedia.toFixed(1)}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-night-700 bg-night-800/80 px-2 py-0.5 text-[11px] font-semibold text-night-300">
                    Ainda não avaliado
                  </span>
                )}
              </p>
            </div>
          </aside>

          {/* Coluna direita: Estúdio de Avaliação */}
          <form
            onSubmit={lidarComEnvio}
            aria-label={`Avaliação de ${jogo.titulo}`}
            className="rounded-3xl border border-night-700/80 bg-night-900/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-8"
          >
            <header className="space-y-1 border-b border-night-800 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fire-400">
                Registro na Fogueira
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {registroAtual ? 'Editar sua avaliação' : 'Avaliar este jogo'}
              </h2>
              <p className="text-xs sm:text-sm text-night-400">
                Defina seu status, dê sua nota e registre suas impressões para a comunidade.
              </p>
            </header>

            {/* 1. Status (sem emotes) */}
            <section aria-labelledby="secao-status-avaliacao" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 id="secao-status-avaliacao" className="text-sm font-bold text-white">
                  Status
                </h3>
                <span className="text-xs text-night-400">Como está sua jornada</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {OPCOES_STATUS.map((opcao) => {
                  const ativo = status === opcao.valor;
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setStatus(opcao.valor)}
                      className={cn(
                        'rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                        ativo
                          ? 'border-fire-500 bg-fire-500/15 shadow-md shadow-fire-500/10'
                          : 'border-night-700/90 bg-night-950/60 hover:border-night-500 hover:bg-night-800/70'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'text-sm font-bold',
                            ativo ? 'text-white' : 'text-night-200'
                          )}
                        >
                          {opcao.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-2 w-2 rounded-full transition-colors',
                            ativo ? 'bg-fire-400' : 'bg-night-700'
                          )}
                        />
                      </div>
                      <p className="text-[11px] text-night-400 mt-1 leading-snug">
                        {opcao.descricao}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Nota em chamas crescentes (0.5 a 5.0) + Favorito */}
            <section
              aria-labelledby="secao-nota-avaliacao"
              className="relative overflow-hidden rounded-2xl border border-night-800 bg-night-950/75 p-5 sm:p-6 space-y-5"
            >
              {/* Aura da fogueira que cresce conforme a nota */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 left-10 h-44 w-72 rounded-full blur-3xl transition-all duration-500"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,140,66,0.55) 0%, rgba(234,88,12,0.25) 55%, transparent 100%)',
                  opacity: Math.max(0.12, notaExibida / 5.5),
                  transform: `scale(${0.75 + (notaExibida / 5) * 0.5})`,
                }}
              />

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 id="secao-nota-avaliacao" className="text-sm font-bold text-white">
                    Intensidade da Fogueira
                  </h3>
                  <p className="text-xs text-night-400 mt-0.5">
                    Da menor brasa à chama máxima — clique na metade esquerda ou direita para 0.5
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFavorito((anterior) => !anterior)}
                  aria-pressed={favorito}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer',
                    favorito
                      ? 'border-rose-500/70 bg-rose-500/15 text-rose-300'
                      : 'border-night-700 bg-night-900 text-night-300 hover:text-white hover:border-night-500'
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill={favorito ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{favorito ? 'Nos favoritos' : 'Favoritar'}</span>
                </button>
              </div>

              <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 pt-2">
                <div
                  className="relative flex items-end gap-2 sm:gap-3"
                  onMouseLeave={() => setNotaHover(null)}
                >
                  {[1, 2, 3, 4, 5].map((nivel) => {
                    const preenchimento: 'cheia' | 'meia' | 'vazia' =
                      notaExibida >= nivel
                        ? 'cheia'
                        : notaExibida >= nivel - 0.5
                          ? 'meia'
                          : 'vazia';

                    return (
                      <div
                        key={nivel}
                        className="relative flex items-end justify-center transition-transform duration-150 hover:scale-110"
                      >
                        {/* Faíscas subindo quando atinge chama máxima */}
                        {nivel === 5 && notaExibida >= 4.5 && (
                          <>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -top-1 left-1/3 h-1.5 w-1.5 rounded-full bg-ember-300 animar-faisca-1"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute top-0 right-1/4 h-1 w-1 rounded-full bg-fire-400 animar-faisca-2"
                            />
                          </>
                        )}

                        <ChamaSvg
                          nivel={nivel}
                          preenchimento={preenchimento}
                          uid={`${jogo.id}-${nivel}`}
                        />
                        <button
                          type="button"
                          aria-label={`Dar nota ${nivel - 0.5}`}
                          onMouseEnter={() => setNotaHover(nivel - 0.5)}
                          onClick={() => setNota(nivel - 0.5)}
                          className="absolute inset-y-0 left-0 w-1/2 cursor-pointer focus:outline-none"
                        />
                        <button
                          type="button"
                          aria-label={`Dar nota ${nivel}`}
                          onMouseEnter={() => setNotaHover(nivel)}
                          onClick={() => setNota(nivel)}
                          className="absolute inset-y-0 right-0 w-1/2 cursor-pointer focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-baseline gap-2.5 pb-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                    {notaExibida.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-ember-400">
                    {obterDescricaoNota(notaExibida)}
                  </span>
                </div>
              </div>

              {/* Barra sutil de calor */}
              <div className="relative z-10 h-1.5 w-full rounded-full bg-night-800/90 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-fire-700 via-fire-500 to-ember-300 transition-all duration-300"
                  style={{ width: `${(notaExibida / 5) * 100}%` }}
                />
              </div>
            </section>

            {/* 3. Pontos fortes rápidos */}
            <section aria-labelledby="secao-tags-avaliacao" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 id="secao-tags-avaliacao" className="text-sm font-bold text-white">
                  O que mais se destacou{' '}
                  <span className="text-xs font-normal text-night-400">(opcional)</span>
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {DESTAQUES_SUGERIDOS.map((tag) => {
                  const ativa = tagsSelecionadas.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={ativa}
                      onClick={() => alternarTag(tag)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                        ativa
                          ? 'border-fire-500/80 bg-fire-500/15 text-ember-300'
                          : 'border-night-700 bg-night-950/60 text-night-300 hover:border-night-500 hover:text-white'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. Review escrita */}
            <section className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="review-avaliacao-pagina" className="text-sm font-bold text-white">
                  Sua review{' '}
                  <span className="text-xs font-normal text-night-400">(opcional)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-night-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={contemSpoiler}
                    onChange={(e) => setContemSpoiler(e.target.checked)}
                    className="accent-fire-500 h-3.5 w-3.5 rounded"
                  />
                  <span>Contém spoilers</span>
                </label>
              </div>

              <textarea
                id="review-avaliacao-pagina"
                rows={6}
                maxLength={1200}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder={`Escreva o que mais te marcou em ${jogo.titulo}, sem pressa...`}
                className="w-full rounded-2xl border border-night-700 bg-night-950/80 px-4 py-3.5 text-sm text-white placeholder:text-night-500 focus:border-fire-500 focus:outline-none leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between text-[11px] text-night-400">
                <span>Se escrever uma review, ela será exibida na Fogueira e na página do jogo.</span>
                <span className="tabular-nums">{comentario.length}/1200</span>
              </div>
            </section>

            {/* 5. Ações finais */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-night-800">
              <Botao
                type="button"
                variante="fantasma"
                tamanho="medio"
                onClick={() => navegar(-1)}
              >
                Cancelar
              </Botao>
              <Botao type="submit" variante="primario" tamanho="grande">
                {registroAtual ? 'Atualizar avaliação' : 'Publicar avaliação'}
              </Botao>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
