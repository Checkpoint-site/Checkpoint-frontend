import React from 'react';

interface HistogramaNotasProps {
  distribuicao: Record<number, number>;
  totalAvaliacoes?: number;
}

export const HistogramaNotas: React.FC<HistogramaNotasProps> = ({
  distribuicao,
  totalAvaliacoes = 47,
}) => {
  const valores = Object.values(distribuicao);
  const maxValor = Math.max(...valores, 1);

  return (
    <div className="w-full bg-night-950/60 p-4 rounded-xl border border-night-800">
      <div className="flex items-center justify-between mb-3 border-b border-night-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-night-400">
          Avaliações
        </h3>
        <span className="text-[11px] font-semibold text-night-400">
          {totalAvaliacoes} total
        </span>
      </div>

      {/* Gráfico de barras minimalista vertical */}
      <div className="h-24 flex items-end gap-2.5 pt-2 px-1">
        {[1, 2, 3, 4, 5].map((nota) => {
          const qtd = distribuicao[nota] || 0;
          const alturaPercentual = Math.round((qtd / maxValor) * 100);

          return (
            <div
              key={`nota-${nota}`}
              className="flex-1 flex flex-col items-center h-full justify-end group"
            >
              <div
                style={{ height: `${Math.max(alturaPercentual, 8)}%` }}
                className="w-full rounded-t bg-night-700 group-hover:bg-fire-500 transition-colors relative"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-night-900 border border-night-700 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                  {qtd} {qtd === 1 ? 'jogo' : 'jogos'}
                </div>
              </div>
              <span className="text-[10px] text-night-400 mt-1 font-semibold group-hover:text-ember-400">
                {nota}★
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
