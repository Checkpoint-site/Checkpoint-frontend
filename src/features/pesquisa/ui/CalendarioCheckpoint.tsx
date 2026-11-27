import React, { useMemo, useState } from 'react';
import { cn } from '@shared/lib';
import {
  IconeSetaBaixo,
  IconeSetaDireita,
  IconeSetaEsquerda,
} from '@shared/ui';

export interface CalendarioCheckpointProps {
  dataSelecionada: string;
  aoSelecionarData: (dataIso: string) => void;
  className?: string;
}

type ModoVisualizacaoCalendario = 'dias' | 'meses' | 'anos';

const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const MESES_ABREVIADOS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const QUANTIDADE_ANOS_GRADE = 12;

function extrairAnoMesInicial(dataIso: string): { ano: number; mes: number } {
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(dataIso)) {
    const [anoTexto, mesTexto] = dataIso.split('-');
    const ano = Number(anoTexto);
    const mes = Number(mesTexto) - 1;
    if (!Number.isNaN(ano) && mes >= 0 && mes <= 11) {
      return { ano, mes };
    }
  }
  if (/^\d{4}$/.test(dataIso)) {
    const ano = Number(dataIso);
    if (!Number.isNaN(ano)) {
      return { ano, mes: new Date().getMonth() };
    }
  }
  const hoje = new Date();
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
}

function formatarParaIso(ano: number, mes: number, dia: number): string {
  const mesFormatado = String(mes + 1).padStart(2, '0');
  const diaFormatado = String(dia).padStart(2, '0');
  return `${ano}-${mesFormatado}-${diaFormatado}`;
}

export function formatarDataExibicao(dataIso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  if (/^\d{4}-\d{2}$/.test(dataIso)) {
    const [ano, mesTexto] = dataIso.split('-');
    const indiceMes = Number(mesTexto) - 1;
    if (indiceMes >= 0 && indiceMes <= 11) {
      return `${NOMES_MESES[indiceMes]} de ${ano}`;
    }
    return `${mesTexto}/${ano}`;
  }
  if (/^\d{4}$/.test(dataIso)) {
    return `Ano ${dataIso}`;
  }
  return '';
}

export const CalendarioCheckpoint: React.FC<CalendarioCheckpointProps> = ({
  dataSelecionada,
  aoSelecionarData,
  className,
}) => {
  const inicial = extrairAnoMesInicial(dataSelecionada);
  const [anoVisivel, setAnoVisivel] = useState<number>(inicial.ano);
  const [mesVisivel, setMesVisivel] = useState<number>(inicial.mes);
  const [modo, setModo] = useState<ModoVisualizacaoCalendario>('dias');
  const [anoBaseGrade, setAnoBaseGrade] = useState<number>(
    () => inicial.ano - (inicial.ano % QUANTIDADE_ANOS_GRADE)
  );

  const hojeIso = useMemo(() => {
    const agora = new Date();
    return formatarParaIso(agora.getFullYear(), agora.getMonth(), agora.getDate());
  }, []);

  const celulasDias = useMemo(() => {
    const primeiroDiaSemana = new Date(anoVisivel, mesVisivel, 1).getDay();
    const totalDiasMes = new Date(anoVisivel, mesVisivel + 1, 0).getDate();

    const lista: Array<number | null> = [];
    for (let i = 0; i < primeiroDiaSemana; i += 1) {
      lista.push(null);
    }
    for (let dia = 1; dia <= totalDiasMes; dia += 1) {
      lista.push(dia);
    }
    return lista;
  }, [anoVisivel, mesVisivel]);

  const listaAnosGrade = useMemo(
    () =>
      Array.from(
        { length: QUANTIDADE_ANOS_GRADE },
        (_, indice) => anoBaseGrade + indice
      ),
    [anoBaseGrade]
  );

  const navegarAnterior = () => {
    if (modo === 'anos') {
      setAnoBaseGrade((anterior) => anterior - QUANTIDADE_ANOS_GRADE);
      return;
    }
    if (modo === 'meses') {
      setAnoVisivel((anterior) => anterior - 1);
      return;
    }
    if (mesVisivel === 0) {
      setMesVisivel(11);
      setAnoVisivel((anterior) => anterior - 1);
    } else {
      setMesVisivel((anterior) => anterior - 1);
    }
  };

  const navegarProximo = () => {
    if (modo === 'anos') {
      setAnoBaseGrade((anterior) => anterior + QUANTIDADE_ANOS_GRADE);
      return;
    }
    if (modo === 'meses') {
      setAnoVisivel((anterior) => anterior + 1);
      return;
    }
    if (mesVisivel === 11) {
      setMesVisivel(0);
      setAnoVisivel((anterior) => anterior + 1);
    } else {
      setMesVisivel((anterior) => anterior + 1);
    }
  };

  const alternarModoMeses = () => {
    setModo((atual) => (atual === 'meses' ? 'dias' : 'meses'));
  };

  const alternarModoAnos = () => {
    setAnoBaseGrade(anoVisivel - (anoVisivel % QUANTIDADE_ANOS_GRADE));
    setModo((atual) => (atual === 'anos' ? 'dias' : 'anos'));
  };

  const selecionarHoje = () => {
    const agora = new Date();
    setAnoVisivel(agora.getFullYear());
    setMesVisivel(agora.getMonth());
    setModo('dias');
    aoSelecionarData(hojeIso);
  };

  const rotuloAnterior =
    modo === 'anos'
      ? 'Anos anteriores'
      : modo === 'meses'
        ? 'Ano anterior'
        : 'Mês anterior';

  const rotuloProximo =
    modo === 'anos'
      ? 'Próximos anos'
      : modo === 'meses'
        ? 'Próximo ano'
        : 'Próximo mês';

  return (
    <div
      role="dialog"
      aria-label="Calendário de pesquisa por data"
      className={cn(
        'w-76 rounded-2xl border border-night-700/90 bg-night-900/98 p-4 shadow-2xl shadow-black/70 backdrop-blur-xl animar-entrada-painel',
        className
      )}
    >
      {/* Cabeçalho com seletores clicáveis de Mês e Ano */}
      <div className="mb-3 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={navegarAnterior}
          aria-label={rotuloAnterior}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-night-700/80 bg-night-800/80 text-night-300 hover:border-fire-500/50 hover:text-ember-400 transition-colors cursor-pointer"
        >
          <IconeSetaEsquerda tamanho={15} />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={alternarModoMeses}
            aria-label="Selecionar mês"
            aria-expanded={modo === 'meses'}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-tight transition-all cursor-pointer',
              modo === 'meses'
                ? 'border-fire-500/60 bg-fire-500/15 text-ember-300'
                : 'border-night-700/80 bg-night-800/70 text-white hover:border-fire-500/40 hover:text-ember-300'
            )}
          >
            <span>{NOMES_MESES[mesVisivel]}</span>
            <IconeSetaBaixo
              tamanho={12}
              className={cn(
                'text-night-400 transition-transform duration-200',
                modo === 'meses' && 'rotate-180 text-ember-400'
              )}
            />
          </button>

          <button
            type="button"
            onClick={alternarModoAnos}
            aria-label="Selecionar ano"
            aria-expanded={modo === 'anos'}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-tight transition-all cursor-pointer',
              modo === 'anos'
                ? 'border-fire-500/60 bg-fire-500/15 text-ember-300'
                : 'border-night-700/80 bg-night-800/70 text-ember-400 hover:border-fire-500/40 hover:text-ember-300'
            )}
          >
            <span>{modo === 'anos' ? `${listaAnosGrade[0]}–${listaAnosGrade[listaAnosGrade.length - 1]}` : anoVisivel}</span>
            <IconeSetaBaixo
              tamanho={12}
              className={cn(
                'text-night-400 transition-transform duration-200',
                modo === 'anos' && 'rotate-180 text-ember-400'
              )}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={navegarProximo}
          aria-label={rotuloProximo}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-night-700/80 bg-night-800/80 text-night-300 hover:border-fire-500/50 hover:text-ember-400 transition-colors cursor-pointer"
        >
          <IconeSetaDireita tamanho={15} />
        </button>
      </div>

      {/* Visualização 1: Grade de Meses */}
      {modo === 'meses' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {MESES_ABREVIADOS.map((mesCurto, indiceMes) => {
              const ativo = indiceMes === mesVisivel;
              return (
                <button
                  key={mesCurto}
                  type="button"
                  onClick={() => {
                    setMesVisivel(indiceMes);
                    setModo('dias');
                  }}
                  className={cn(
                    'rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer',
                    ativo
                      ? 'bg-linear-to-r from-fire-600 to-ember-500 text-white font-bold shadow-[0_0_12px_rgba(255,107,43,0.5)]'
                      : 'border border-night-800 bg-night-950/60 text-night-300 hover:border-fire-500/40 hover:bg-night-800 hover:text-white'
                  )}
                >
                  {mesCurto}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              aoSelecionarData(
                `${anoVisivel}-${String(mesVisivel + 1).padStart(2, '0')}`
              )
            }
            className="w-full rounded-xl border border-ember-400/30 bg-fire-500/10 py-1.5 text-[11px] font-semibold text-ember-300 hover:bg-fire-500/20 transition-colors cursor-pointer"
          >
            Filtrar mês inteiro ({NOMES_MESES[mesVisivel]} de {anoVisivel})
          </button>
        </div>
      )}

      {/* Visualização 2: Grade de Anos */}
      {modo === 'anos' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {listaAnosGrade.map((anoItem) => {
              const ativo = anoItem === anoVisivel;
              return (
                <button
                  key={anoItem}
                  type="button"
                  onClick={() => {
                    setAnoVisivel(anoItem);
                    setModo('meses');
                  }}
                  className={cn(
                    'rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer',
                    ativo
                      ? 'bg-linear-to-r from-fire-600 to-ember-500 text-white font-bold shadow-[0_0_12px_rgba(255,107,43,0.5)]'
                      : 'border border-night-800 bg-night-950/60 text-night-300 hover:border-fire-500/40 hover:bg-night-800 hover:text-white'
                  )}
                >
                  {anoItem}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => aoSelecionarData(String(anoVisivel))}
            className="w-full rounded-xl border border-ember-400/30 bg-fire-500/10 py-1.5 text-[11px] font-semibold text-ember-300 hover:bg-fire-500/20 transition-colors cursor-pointer"
          >
            Filtrar ano inteiro ({anoVisivel})
          </button>
        </div>
      )}

      {/* Visualização 3: Grade de Dias */}
      {modo === 'dias' && (
        <>
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
            {DIAS_SEMANA.map((diaSemana) => (
              <span
                key={diaSemana}
                className="py-1 text-[10px] font-bold uppercase tracking-wider text-night-400"
              >
                {diaSemana}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {celulasDias.map((dia, indice) => {
              if (dia === null) {
                return <span key={`vazio-${indice}`} className="h-8 w-8" />;
              }

              const dataIso = formatarParaIso(anoVisivel, mesVisivel, dia);
              const selecionado = dataIso === dataSelecionada;
              const ehHoje = dataIso === hojeIso;

              return (
                <button
                  key={dataIso}
                  type="button"
                  onClick={() => aoSelecionarData(dataIso)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                    selecionado
                      ? 'bg-linear-to-br from-fire-500 to-ember-400 text-night-950 font-extrabold shadow-[0_0_12px_rgba(255,107,43,0.65)] scale-105'
                      : ehHoje
                        ? 'border border-ember-400/60 bg-night-800/70 text-ember-300 hover:bg-night-700'
                        : 'text-night-300 hover:bg-night-800 hover:text-white'
                  )}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Rodapé de ações rápidas */}
      <div className="mt-3 flex items-center justify-between border-t border-night-800 pt-2.5 text-xs">
        <button
          type="button"
          onClick={() => aoSelecionarData('')}
          className="font-medium text-night-400 hover:text-white transition-colors cursor-pointer"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={selecionarHoje}
          className="font-semibold text-ember-400 hover:text-fire-400 transition-colors cursor-pointer"
        >
          Hoje
        </button>
      </div>
    </div>
  );
};
