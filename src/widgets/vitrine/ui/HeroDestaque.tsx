import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { JogoResumo } from '@entities/index';
import { rotaJogo } from '@shared/config';
import { cn } from '@shared/lib';
import { Botao, IconeChamaNota } from '@shared/ui';
import { CapaJogoEstilizada } from './CapaJogoEstilizada';

interface HeroDestaqueProps {
  destaques: JogoResumo[];
  naListaQueroJogar: Record<string, boolean>;
  notasUsuario?: Record<string, number>;
  aoAlternarQueroJogar: (jogoId: string) => void;
  aoAbrirAvaliacao: (jogo: JogoResumo) => void;
}

export const HeroDestaque: React.FC<HeroDestaqueProps> = ({
  destaques,
  naListaQueroJogar,
  notasUsuario = {},
  aoAlternarQueroJogar,
  aoAbrirAvaliacao,
}) => {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const jogo = destaques[indiceAtivo] ?? destaques[0];

  useEffect(() => {
    if (destaques.length <= 1 || pausado) return;
    const timer = window.setInterval(() => {
      setIndiceAtivo((atual) => (atual + 1) % destaques.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [destaques.length, pausado]);

  if (!jogo) return null;

  const salvo = Boolean(naListaQueroJogar[jogo.id]);
  const minhaNota = notasUsuario[jogo.id];

  return (
    <section
      aria-label="Destaque principal"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="relative w-full overflow-hidden border-b border-night-800/80"
    >
      {/* Fundo cinematográfico com degradê dinâmico do jogo */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 76% 28%, ${jogo.corSecundaria} 0%, #0b1320 60%, #05080f 100%)`,
        }}
        aria-hidden="true"
      />
      {jogo.bannerUrl && (
        <img
          src={jogo.bannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-lighten"
          aria-hidden="true"
        />
      )}

      {/* Brilho atmosférico + degradês de leitura */}
      <div
        className="pointer-events-none absolute -top-24 right-[10%] h-[420px] w-[420px] rounded-full blur-3xl opacity-35 transition-colors duration-700"
        style={{ backgroundColor: jogo.corAcento }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-night-950/95 via-night-900/78 to-night-950/35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-night-900 to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-10 pt-10 pb-12 sm:pt-14 sm:pb-16 min-h-[420px] sm:min-h-[490px] flex flex-col justify-between gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_270px] xl:grid-cols-[minmax(0,1fr)_300px] items-end gap-8 my-auto">
          {/* Bloco editorial esquerdo */}
          <div className="max-w-2xl space-y-4">
            {/* Badges de destaque */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fire-500/40 bg-fire-500/15 px-3 py-1 text-ember-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-fire-400 animate-pulse" />
                {jogo.badge ?? 'Destaque na Fogueira'}
              </span>
              {jogo.notaMedia > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-night-950/70 px-2.5 py-1 text-ember-400 backdrop-blur-sm">
                  <IconeChamaNota tamanho={13} />
                  <span>{jogo.notaMedia.toFixed(1)}</span>
                  <span className="text-night-300 font-normal">
                    · {jogo.totalAvaliacoes.toLocaleString('pt-BR')}{' '}
                    {jogo.totalAvaliacoes === 1 ? 'registro' : 'registros'}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-night-950/70 px-2.5 py-1 text-night-300 backdrop-blur-sm">
                  Ainda não avaliado
                </span>
              )}
              {minhaNota && (
                <span className="inline-flex items-center gap-1 rounded-full border border-fire-500/40 bg-night-950/70 px-2.5 py-1 text-fire-300">
                  <span>Sua nota:</span>
                  <IconeChamaNota tamanho={13} />
                  <span>{minhaNota.toFixed(1)}</span>
                </span>
              )}
              <span className="text-night-300">{jogo.ano}</span>
            </div>

            {/* Título clicável para a página do jogo */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              <Link
                to={rotaJogo(jogo.id)}
                className="hover:text-ember-300 transition-colors focus:outline-none focus-visible:underline"
              >
                {jogo.titulo}
              </Link>
            </h1>

            {/* Gêneros + estúdio */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-night-300">
              {jogo.generos.map((genero) => (
                <span
                  key={genero}
                  className="rounded-md border border-night-700/80 bg-night-800/75 px-2.5 py-1 font-medium text-night-300"
                >
                  {genero}
                </span>
              ))}
              <span className="text-night-400">· {jogo.desenvolvedora}</span>
            </div>

            {/* Sinopse curta */}
            <p className="text-sm sm:text-base text-night-300 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
              {jogo.sinopseCurta}
            </p>

            {/* Ações principais */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Botao
                variante="primario"
                tamanho="medio"
                onClick={() => aoAbrirAvaliacao(jogo)}
              >
                <IconeChamaNota tamanho={15} />
                <span>Registrar / Avaliar</span>
              </Botao>

              <Botao
                variante="contorno"
                tamanho="medio"
                onClick={() => aoAlternarQueroJogar(jogo.id)}
                className={cn(
                  'backdrop-blur-sm bg-night-900/50',
                  salvo && 'border-ember-400/70 text-ember-300 bg-fire-500/15'
                )}
              >
                {salvo ? '✓ Na minha lista' : '+ Quero Jogar'}
              </Botao>

              <Link
                to={rotaJogo(jogo.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-night-950/55 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-night-200 hover:text-white hover:border-white/25 hover:bg-night-900/80 transition-all"
              >
                <span>Ver página</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Pôster flutuante de vitrine (desktop) */}
          <div className="hidden lg:flex justify-end">
            <Link
              to={rotaJogo(jogo.id)}
              aria-label={`Abrir página de ${jogo.titulo}`}
              className="group relative block w-[230px] xl:w-[252px] aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.85)] transition-all duration-500 hover:-translate-y-1.5 hover:ring-fire-500/70"
            >
              <CapaJogoEstilizada jogo={jogo} />
              <div className="absolute inset-0 bg-linear-to-t from-night-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ember-300">
                  Explorar jogo & reviews →
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Seletor de destaques com barra de progresso */}
        {destaques.length > 1 && (
          <div
            className="flex flex-wrap items-center justify-between gap-4 pt-2"
          >
            <p className="hidden sm:block text-[11px] uppercase tracking-[0.18em] text-night-400 font-semibold">
              Em destaque na fogueira · {indiceAtivo + 1} / {destaques.length}
            </p>
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Escolher jogo em destaque"
            >
              {destaques.map((item, idx) => {
                const ativo = idx === indiceAtivo;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    onClick={() => setIndiceAtivo(idx)}
                    className={cn(
                      'group relative overflow-hidden flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer',
                      ativo
                        ? 'border-fire-500/70 bg-night-950/90 text-white shadow-md shadow-fire-500/15'
                        : 'border-night-700/70 bg-night-950/50 text-night-300 hover:border-night-500 hover:text-white'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full transition-all',
                        ativo ? 'bg-fire-400 scale-110' : 'bg-night-500 group-hover:bg-night-300'
                      )}
                    />
                    <span className="hidden md:inline max-w-[140px] truncate">{item.titulo}</span>
                    {ativo && !pausado && (
                      <span
                        key={`progresso-${item.id}-${indiceAtivo}`}
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-fire-500 to-ember-400 animar-progresso-destaque"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
