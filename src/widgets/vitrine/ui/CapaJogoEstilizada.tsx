import React, { useEffect, useMemo, useState } from 'react';
import type { JogoResumo } from '@entities/index';
import { cn } from '@shared/lib';

interface CapaJogoEstilizadaProps {
  jogo: Pick<
    JogoResumo,
    | 'titulo'
    | 'ano'
    | 'desenvolvedora'
    | 'capaUrl'
    | 'corPrimaria'
    | 'corSecundaria'
    | 'corAcento'
    | 'emblema'
  > & {
    steamAppId?: number;
  };
  compacta?: boolean;
  className?: string;
}

const extrairSteamAppId = (steamAppId?: number, capaUrl?: string): number | undefined => {
  if (typeof steamAppId === 'number' && steamAppId > 0) return steamAppId;
  if (!capaUrl) return undefined;
  const match = capaUrl.match(/\/steam\/apps\/(\d+)\//i);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const ehUrlVerticalSteam = (url: string): boolean =>
  /library_600x900/i.test(url) || /portrait/i.test(url);

const construirCandidatosCapa = (steamAppId?: number, capaUrl?: string): string[] => {
  const candidatos: string[] = [];
  const appId = extrairSteamAppId(steamAppId, capaUrl);

  if (capaUrl && ehUrlVerticalSteam(capaUrl)) {
    candidatos.push(capaUrl);
  }

  if (appId) {
    candidatos.push(
      `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
    );
  }

  if (capaUrl) {
    candidatos.push(capaUrl);
  }

  return Array.from(new Set(candidatos));
};

export const CapaJogoEstilizada: React.FC<CapaJogoEstilizadaProps> = ({
  jogo,
  compacta = false,
  className,
}) => {
  const candidatos = useMemo(
    () => construirCandidatosCapa(jogo.steamAppId, jogo.capaUrl),
    [jogo.steamAppId, jogo.capaUrl]
  );

  const [indiceImagem, setIndiceImagem] = useState(0);
  const [ehPaisagem, setEhPaisagem] = useState(false);

  useEffect(() => {
    setIndiceImagem(0);
    setEhPaisagem(false);
  }, [jogo.steamAppId, jogo.capaUrl]);

  const urlAtual = candidatos[indiceImagem];

  if (urlAtual) {
    return (
      <div
        className={cn('relative h-full w-full overflow-hidden bg-night-900 select-none', className)}
      >
        {ehPaisagem && (
          <>
            <img
              src={urlAtual}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-125 blur-xl opacity-55"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-night-950/95 via-night-950/35 to-night-950/55"
            />
          </>
        )}

        <img
          src={urlAtual}
          alt={`Capa de ${jogo.titulo}`}
          loading="lazy"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth > 0 && naturalHeight > 0) {
              setEhPaisagem(naturalWidth > naturalHeight * 1.15);
            }
          }}
          onError={() => {
            setEhPaisagem(false);
            setIndiceImagem((atual) => atual + 1);
          }}
          className={cn(
            'relative z-10 h-full w-full transition-opacity duration-200',
            ehPaisagem ? 'object-contain p-2 drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)]' : 'object-cover'
          )}
        />

        {ehPaisagem && !compacta && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 bg-linear-to-t from-night-950/95 via-night-950/60 to-transparent">
            <p className="text-xs font-extrabold text-white truncate drop-shadow-sm">
              {jogo.titulo}
            </p>
            <p className="text-[10px] font-medium text-white/65">{jogo.ano}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center bg-night-900 border border-night-800 p-3 text-center select-none',
        className
      )}
    >
      <p
        className={cn(
          'font-bold text-night-200 line-clamp-2',
          compacta ? 'text-[10px]' : 'text-xs sm:text-sm'
        )}
      >
        {jogo.titulo}
      </p>
      {!compacta && (
        <span className="mt-1.5 text-[10px] font-medium text-night-500">
          Sem capa disponível
        </span>
      )}
    </div>
  );
};
