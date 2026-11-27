import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adaptarJogoResumoBackend,
  type JogoResumo,
} from '@entities/index';
import { catalogoApi } from '@shared/api';
import { rotaJogo } from '@shared/config';
import { cn } from '@shared/lib';
import {
  IconeAutor,
  IconeCalendario,
  IconeChamaNota,
  IconeFechar,
  IconeLupa,
  IconeNome,
} from '@shared/ui';
import type { FiltroPesquisa, ParametrosPesquisa } from '../model/tipos';
import {
  CalendarioCheckpoint,
  formatarDataExibicao,
} from './CalendarioCheckpoint';

export interface BarraPesquisaExpansivelProps {
  aoPesquisar?: (parametros: ParametrosPesquisa) => void;
  aoAbrir?: () => void;
  aoAlterarExpansao?: (expandida: boolean) => void;
}

const OPCOES_FILTRO: ReadonlyArray<{
  valor: FiltroPesquisa;
  rotulo: string;
  icone: React.ReactNode;
}> = [
  {
    valor: 'nome',
    rotulo: 'Nome',
    icone: <IconeNome tamanho={13} />,
  },
  {
    valor: 'data',
    rotulo: 'Data',
    icone: <IconeCalendario tamanho={13} />,
  },
  {
    valor: 'autor',
    rotulo: 'Autor',
    icone: <IconeAutor tamanho={13} />,
  },
];

export const BarraPesquisaExpansivel: React.FC<BarraPesquisaExpansivelProps> = ({
  aoPesquisar,
  aoAbrir,
  aoAlterarExpansao,
}) => {
  const [expandida, setExpandida] = useState(false);
  const [filtro, setFiltro] = useState<FiltroPesquisa>('nome');
  const [termo, setTermo] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [resumoUltimaBusca, setResumoUltimaBusca] = useState<string | null>(null);
  const [resultadosBusca, setResultadosBusca] = useState<JogoResumo[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requisicaoBuscaRef = useRef(0);
  const timerDebounceRef = useRef<number | null>(null);

  const limparTimerDebounce = () => {
    if (timerDebounceRef.current !== null) {
      window.clearTimeout(timerDebounceRef.current);
      timerDebounceRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      requisicaoBuscaRef.current += 1;
      limparTimerDebounce();
    };
  }, []);

  useEffect(() => {
    if (!expandida) return;

    const lidarCliqueFora = (evento: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target as Node)
      ) {
        limparTimerDebounce();
        requisicaoBuscaRef.current += 1;
        setBuscando(false);
        setExpandida(false);
        setCalendarioAberto(false);
        setResumoUltimaBusca(null);
        setResultadosBusca(null);
      }
    };

    const lidarTeclaEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        if (calendarioAberto) {
          setCalendarioAberto(false);
        } else {
          limparTimerDebounce();
          requisicaoBuscaRef.current += 1;
          setBuscando(false);
          setExpandida(false);
          setResumoUltimaBusca(null);
          setResultadosBusca(null);
        }
      }
    };

    document.addEventListener('mousedown', lidarCliqueFora);
    document.addEventListener('keydown', lidarTeclaEscape);
    return () => {
      document.removeEventListener('mousedown', lidarCliqueFora);
      document.removeEventListener('keydown', lidarTeclaEscape);
    };
  }, [expandida, calendarioAberto]);

  useEffect(() => {
    aoAlterarExpansao?.(expandida);
  }, [expandida, aoAlterarExpansao]);

  useEffect(() => {
    if (expandida && filtro !== 'data') {
      const temporizador = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => window.clearTimeout(temporizador);
    }
  }, [expandida, filtro]);

  const abrirPesquisa = () => {
    setExpandida(true);
    aoAbrir?.();
    if (filtro === 'data') {
      setCalendarioAberto(true);
    }
  };

  const fecharPesquisa = () => {
    limparTimerDebounce();
    requisicaoBuscaRef.current += 1;
    setBuscando(false);
    setExpandida(false);
    setCalendarioAberto(false);
    setResumoUltimaBusca(null);
    setResultadosBusca(null);
  };

  const alternarFiltro = (novoFiltro: FiltroPesquisa) => {
    limparTimerDebounce();
    requisicaoBuscaRef.current += 1;
    setBuscando(false);
    setFiltro(novoFiltro);
    setResumoUltimaBusca(null);
    setResultadosBusca(null);
    if (novoFiltro === 'data') {
      setCalendarioAberto(true);
    } else {
      setCalendarioAberto(false);
    }
  };

  const dispararConsultaCatalogo = async (
    filtroUsado: FiltroPesquisa,
    termoUsado: string,
    dataIsoUsada: string
  ) => {
    const tipoBackend =
      filtroUsado === 'data' ? 'ano' : filtroUsado === 'autor' ? 'autor' : 'nome';
    const termoParaBackend =
      filtroUsado === 'data' ? dataIsoUsada.slice(0, 4) : termoUsado.trim();

    if (termoParaBackend.length < 2) return;

    const idRequisicao = ++requisicaoBuscaRef.current;
    setBuscando(true);

    try {
      const resposta = await catalogoApi.buscar(termoParaBackend, tipoBackend);
      if (idRequisicao !== requisicaoBuscaRef.current) return;
      const adaptados = resposta.itens.slice(0, 8).map(adaptarJogoResumoBackend);
      setResultadosBusca(adaptados);
    } catch {
      if (idRequisicao !== requisicaoBuscaRef.current) return;
      setResultadosBusca([]);
    } finally {
      if (idRequisicao === requisicaoBuscaRef.current) {
        setBuscando(false);
      }
    }
  };

  const atualizarTermoComAutoBusca = (novoValor: string) => {
    setTermo(novoValor);
    limparTimerDebounce();

    const limpo = novoValor.trim();
    if (limpo.length < 2) {
      requisicaoBuscaRef.current += 1;
      setBuscando(false);
      setResumoUltimaBusca(null);
      setResultadosBusca(null);
      return;
    }

    timerDebounceRef.current = window.setTimeout(() => {
      const rotuloFiltro = filtro === 'nome' ? 'Nome' : 'Autor';
      setResumoUltimaBusca(`${rotuloFiltro}: ${limpo}`);
      void dispararConsultaCatalogo(filtro, limpo, dataSelecionada);
    }, 320);
  };

  const executarBusca = (evento: React.FormEvent) => {
    evento.preventDefault();
    limparTimerDebounce();

    const valorAtivo =
      filtro === 'data' ? formatarDataExibicao(dataSelecionada) : termo.trim();

    if (!valorAtivo) {
      if (filtro === 'data') {
        setCalendarioAberto(true);
      } else {
        inputRef.current?.focus();
      }
      return;
    }

    aoPesquisar?.({
      filtro,
      termo: termo.trim(),
      data: dataSelecionada,
    });

    const rotuloFiltro =
      filtro === 'nome' ? 'Nome' : filtro === 'data' ? 'Data' : 'Autor';
    setResumoUltimaBusca(`${rotuloFiltro}: ${valorAtivo}`);
    setCalendarioAberto(false);
    void dispararConsultaCatalogo(filtro, termo, dataSelecionada);
  };

  const placeholderPorFiltro =
    filtro === 'nome'
      ? 'Buscar jogo pelo nome...'
      : 'Buscar por autor ou estúdio...';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center transition-all duration-300',
        expandida && 'md:flex-1 md:max-w-3xl'
      )}
    >
      <div
        className={cn(
          'relative flex items-center overflow-hidden rounded-xl border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
          expandida
            ? 'w-10 md:w-full border-fire-500/60 bg-night-900/95 animar-brasa-pesquisa'
            : 'w-10 h-10 border-night-700/80 bg-night-900/70 hover:border-fire-500/50 hover:bg-night-800/90 hover:shadow-[0_0_14px_rgba(255,107,43,0.22)]'
        )}
      >
        {!expandida ? (
          <button
            type="button"
            onClick={abrirPesquisa}
            aria-label="Abrir pesquisa"
            aria-expanded={expandida}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-night-300 hover:text-ember-400 transition-colors cursor-pointer"
          >
            <IconeLupa tamanho={19} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={fecharPesquisa}
              aria-label="Fechar pesquisa"
              aria-expanded={expandida}
              className="flex md:hidden h-10 w-10 shrink-0 items-center justify-center text-ember-400 cursor-pointer"
            >
              <IconeLupa tamanho={19} />
            </button>

            <form
              onSubmit={executarBusca}
              className="hidden md:flex w-full items-center gap-2 px-2.5 py-1.5"
            >
              <button
                type="submit"
                aria-label="Executar pesquisa"
                className="relative flex h-7 w-7 shrink-0 items-center justify-center text-ember-400 hover:text-fire-400 transition-colors cursor-pointer"
              >
                <span
                  className="pointer-events-none absolute -top-0.5 left-1.5 h-1.5 w-1.5 rounded-full bg-ember-300 shadow-[0_0_6px_#ffb830] animar-faisca-1"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute top-0 right-1 h-1 w-1 rounded-full bg-fire-400 shadow-[0_0_6px_#ff6b2b] animar-faisca-2"
                  aria-hidden="true"
                />
                <IconeLupa
                  tamanho={18}
                  className="drop-shadow-[0_0_6px_rgba(255,184,48,0.6)]"
                />
              </button>

              <div className="flex-1 min-w-0">
                {filtro === 'data' ? (
                  <button
                    type="button"
                    onClick={() => setCalendarioAberto((aberto) => !aberto)}
                    className="flex w-full items-center gap-2 rounded-lg bg-night-950/70 px-2.5 py-1 text-left text-xs font-medium text-white hover:bg-night-950 transition-colors cursor-pointer"
                  >
                    <IconeCalendario tamanho={14} className="text-ember-400 shrink-0" />
                    <span
                      className={cn(
                        'truncate',
                        dataSelecionada ? 'text-ember-300 font-semibold' : 'text-night-400'
                      )}
                    >
                      {dataSelecionada
                        ? formatarDataExibicao(dataSelecionada)
                        : 'Selecionar data no calendário...'}
                    </span>
                  </button>
                ) : (
                  <input
                    ref={inputRef}
                    type="search"
                    value={termo}
                    onChange={(e) => atualizarTermoComAutoBusca(e.target.value)}
                    placeholder={placeholderPorFiltro}
                    aria-label={placeholderPorFiltro}
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-night-400/80 focus:outline-none"
                  />
                )}
              </div>

              <div
                role="tablist"
                aria-label="Opções de filtro da pesquisa"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-night-700/80 bg-night-950/90 p-0.5"
              >
                {OPCOES_FILTRO.map((opcao) => {
                  const ativo = filtro === opcao.valor;
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      role="tab"
                      aria-selected={ativo}
                      onClick={() => alternarFiltro(opcao.valor)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all duration-200 cursor-pointer',
                        ativo
                          ? 'bg-linear-to-r from-fire-600 to-ember-500 text-white shadow-[0_0_10px_rgba(255,107,43,0.4)]'
                          : 'text-night-300 hover:text-white hover:bg-night-800/70'
                      )}
                    >
                      {opcao.icone}
                      <span>{opcao.rotulo}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={fecharPesquisa}
                aria-label="Fechar barra de pesquisa"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-night-400 hover:bg-night-800 hover:text-white transition-colors cursor-pointer"
              >
                <IconeFechar tamanho={15} />
              </button>
            </form>
          </>
        )}
      </div>

      {expandida && (
        <form
          onSubmit={executarBusca}
          className="md:hidden fixed left-3 right-3 top-17 z-50 rounded-2xl border border-fire-500/60 bg-night-900/98 p-3 shadow-2xl backdrop-blur-xl animar-entrada-painel animar-brasa-pesquisa space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <button
              type="submit"
              aria-label="Submeter busca mobile"
              className="flex h-7 w-7 shrink-0 items-center justify-center text-ember-400 hover:text-fire-400 cursor-pointer"
            >
              <IconeLupa tamanho={18} />
            </button>
            <div className="flex-1 min-w-0">
              {filtro === 'data' ? (
                <button
                  type="button"
                  onClick={() => setCalendarioAberto((aberto) => !aberto)}
                  className="flex w-full items-center gap-2 rounded-lg bg-night-950/80 px-2.5 py-1.5 text-left text-xs text-white cursor-pointer"
                >
                  <IconeCalendario tamanho={14} className="text-ember-400" />
                  <span className={dataSelecionada ? 'text-ember-300 font-semibold' : 'text-night-400'}>
                    {dataSelecionada
                      ? formatarDataExibicao(dataSelecionada)
                      : 'Selecionar data no calendário...'}
                  </span>
                </button>
              ) : (
                <input
                  type="search"
                  value={termo}
                  onChange={(e) => atualizarTermoComAutoBusca(e.target.value)}
                  placeholder={placeholderPorFiltro}
                  className="w-full bg-transparent text-sm text-white placeholder:text-night-400 focus:outline-none"
                />
              )}
            </div>
            <button
              type="button"
              onClick={fecharPesquisa}
              aria-label="Fechar pesquisa mobile"
              className="p-1 text-night-400 hover:text-white"
            >
              <IconeFechar tamanho={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl border border-night-700/80 bg-night-950/90 p-1">
            {OPCOES_FILTRO.map((opcao) => {
              const ativo = filtro === opcao.valor;
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => alternarFiltro(opcao.valor)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                    ativo
                      ? 'bg-linear-to-r from-fire-600 to-ember-500 text-white shadow-[0_0_10px_rgba(255,107,43,0.4)]'
                      : 'text-night-300 hover:text-white'
                  )}
                >
                  {opcao.icone}
                  <span>{opcao.rotulo}</span>
                </button>
              );
            })}
          </div>
        </form>
      )}

      {expandida && filtro === 'data' && calendarioAberto && (
        <div className="fixed md:absolute right-3 md:right-0 top-36 md:top-12 z-50">
          <CalendarioCheckpoint
            dataSelecionada={dataSelecionada}
            aoSelecionarData={(novaData) => {
              setDataSelecionada(novaData);
              if (novaData) {
                setCalendarioAberto(false);
                aoPesquisar?.({
                  filtro: 'data',
                  termo: '',
                  data: novaData,
                });
                setResumoUltimaBusca(`Data: ${formatarDataExibicao(novaData)}`);
                void dispararConsultaCatalogo('data', '', novaData);
              } else {
                setResumoUltimaBusca(null);
                setResultadosBusca(null);
              }
            }}
          />
        </div>
      )}

      {expandida && resumoUltimaBusca && !calendarioAberto && (
        <div
          role="status"
          className="fixed md:absolute left-3 right-3 md:left-0 md:right-0 top-36 md:top-12 md:w-full z-40 rounded-2xl border border-ember-400/30 bg-night-900/98 p-3 text-xs text-night-300 shadow-2xl backdrop-blur-xl animar-entrada-painel space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ember-400 shadow-[0_0_6px_#ffb830]" />
              <span>
                Filtro aplicado (<strong className="text-ember-300">{resumoUltimaBusca}</strong>)
              </span>
            </div>
            {buscando && (
              <span className="text-[11px] font-medium text-fire-400 animate-pulse">
                Buscando na Steam...
              </span>
            )}
          </div>

          {!buscando && resultadosBusca && resultadosBusca.length > 0 && (
            <ul
              aria-label="Resultados da busca no catálogo"
              className="max-h-80 overflow-y-auto divide-y divide-night-800/80 border-t border-night-800 pt-1.5"
            >
              {resultadosBusca.map((jogo) => (
                <li key={jogo.id}>
                  <Link
                    to={rotaJogo(jogo.id)}
                    onClick={fecharPesquisa}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-night-800/85 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {jogo.capaUrl ? (
                        <img
                          src={jogo.capaUrl}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded-md object-cover border border-white/10"
                        />
                      ) : (
                        <div
                          className="h-10 w-16 shrink-0 rounded-md border border-white/10 flex items-center justify-center text-[10px] font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${jogo.corPrimaria}, ${jogo.corSecundaria})`,
                          }}
                        >
                          {jogo.ano}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{jogo.titulo}</p>
                        <p className="text-[11px] text-night-400 truncate">
                          {jogo.desenvolvedora} · {jogo.ano}
                        </p>
                      </div>
                    </div>
                    {jogo.notaMedia > 0 ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-ember-400/25 bg-night-950/90 px-2 py-0.5 text-[11px] font-bold text-ember-400">
                        <IconeChamaNota tamanho={11} />
                        <span>{jogo.notaMedia.toFixed(1)}</span>
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-md border border-night-700 bg-night-950/90 px-2 py-0.5 text-[10px] font-semibold text-night-400">
                        Ainda não avaliado
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!buscando && resultadosBusca && resultadosBusca.length === 0 && (
            <p className="border-t border-night-800 pt-2 text-[11px] text-night-400">
              Nenhum jogo encontrado para este filtro.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
