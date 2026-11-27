import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { JogoResumo, RegistroJogoUsuario, StatusBiblioteca } from '@entities/index';
import { rotaAvaliarJogo } from '@shared/config';
import { cn } from '@shared/lib';
import { Botao, IconeChamaNota } from '@shared/ui';

export interface DadosEnvioAvaliacaoRapida {
  jogo: JogoResumo;
  nota: number;
  status: StatusBiblioteca;
  comentario: string;
  contemSpoiler?: boolean;
  favorito?: boolean;
}

interface ModalAvaliacaoRapidaProps {
  jogo: JogoResumo | null;
  registroInicial?: RegistroJogoUsuario;
  aoFechar: () => void;
  aoSalvar: (dados: DadosEnvioAvaliacaoRapida) => void;
}

const OPCOES_STATUS: { valor: StatusBiblioteca; label: string }[] = [
  { valor: 'zerado', label: 'Zerado' },
  { valor: 'jogando', label: 'Jogando' },
  { valor: 'quero_jogar', label: 'Quero jogar' },
  { valor: 'abandonado', label: 'Pausado' },
];

export const obterDescricaoNota = (nota: number): string => {
  if (nota >= 4.8) return 'Obra-prima';
  if (nota >= 4.2) return 'Incrível';
  if (nota >= 3.5) return 'Muito bom';
  if (nota >= 2.5) return 'Legal';
  if (nota >= 1.5) return 'Mediano';
  return 'Não curti';
};

export const ModalAvaliacaoRapida: React.FC<ModalAvaliacaoRapidaProps> = ({
  jogo,
  registroInicial,
  aoFechar,
  aoSalvar,
}) => {
  const [nota, setNota] = useState(registroInicial?.nota ?? 5);
  const [status, setStatus] = useState<StatusBiblioteca>(registroInicial?.status ?? 'zerado');
  const [favorito, setFavorito] = useState<boolean>(Boolean(registroInicial?.favorito));
  const [comentario, setComentario] = useState(registroInicial?.comentario ?? '');
  const [contemSpoiler, setContemSpoiler] = useState<boolean>(
    Boolean(registroInicial?.contemSpoiler)
  );

  useEffect(() => {
    if (!jogo) return;
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', lidarComTecla);
    return () => window.removeEventListener('keydown', lidarComTecla);
  }, [jogo, aoFechar]);

  if (!jogo) return null;

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    aoSalvar({
      jogo,
      nota,
      status,
      comentario: comentario.trim(),
      contemSpoiler,
      favorito,
    });
    aoFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Avaliar ${jogo.titulo}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-night-700 bg-night-900 p-6 shadow-2xl shadow-black/70 animar-entrada-painel">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fire-400">
              Registrar na Fogueira
            </p>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{jogo.titulo}</h3>
            <p className="text-xs text-night-400">
              {jogo.desenvolvedora} · {jogo.ano}
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-night-400 hover:text-white hover:bg-night-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={lidarComEnvio} className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-night-300">Status</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OPCOES_STATUS.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setStatus(opcao.valor)}
                  className={cn(
                    'rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer',
                    status === opcao.valor
                      ? 'border-fire-500 bg-fire-500/15 text-ember-300'
                      : 'border-night-700 bg-night-800/70 text-night-300 hover:text-white'
                  )}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-night-800 bg-night-950/60 p-3.5">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-night-300">Sua nota</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    onClick={() =>
                      setNota((atual) => (atual === estrela ? estrela - 0.5 : estrela))
                    }
                    aria-label={`Dar nota ${estrela}`}
                    className={cn(
                      'transition-transform hover:scale-110 cursor-pointer leading-none',
                      estrela > Math.ceil(nota) && 'opacity-25 grayscale',
                      estrela - 0.5 === nota && 'opacity-65'
                    )}
                  >
                    <IconeChamaNota tamanho={14 + estrela * 3} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-white">{nota.toFixed(1)}</span>
                <span className="text-xs font-medium text-ember-300">
                  · {obterDescricaoNota(nota)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFavorito((anterior) => !anterior)}
              aria-pressed={favorito}
              className={cn(
                'rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
                favorito
                  ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                  : 'border-night-700 bg-night-800/70 text-night-300 hover:text-white'
              )}
            >
              {favorito ? 'Favoritado' : 'Favoritar'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="comentario-review" className="text-xs font-semibold text-night-300">
                Impressões rápidas (opcional)
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] text-night-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contemSpoiler}
                  onChange={(e) => setContemSpoiler(e.target.checked)}
                  className="accent-fire-500 rounded"
                />
                <span>Contém spoilers</span>
              </label>
            </div>
            <textarea
              id="comentario-review"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="O que mais te marcou nesse jogo?"
              className="w-full rounded-xl border border-night-700 bg-night-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-night-500 focus:border-fire-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-night-800">
            <Link
              to={rotaAvaliarJogo(jogo.id)}
              onClick={aoFechar}
              className="text-xs font-semibold text-ember-400 hover:text-ember-300 transition-colors"
            >
              Abrir página de avaliação →
            </Link>

            <div className="flex items-center gap-2.5">
              <Botao type="button" variante="fantasma" tamanho="medio" onClick={aoFechar}>
                Cancelar
              </Botao>
              <Botao type="submit" variante="primario" tamanho="medio">
                Salvar registro
              </Botao>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
