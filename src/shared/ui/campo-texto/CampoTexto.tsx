import React from 'react';
import { cn } from '@shared/lib';

export interface CampoTextoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  erro?: string;
  dica?: string;
  iconeEsquerda?: React.ReactNode;
  elementoDireita?: React.ReactNode;
}

export const CampoTexto = React.forwardRef<HTMLInputElement, CampoTextoProps>(
  (
    {
      className,
      rotulo,
      erro,
      dica,
      iconeEsquerda,
      elementoDireita,
      id,
      ...props
    },
    ref
  ) => {
    const idGerado = React.useId();
    const idCampo = id || idGerado;

    return (
      <div className="w-full space-y-1.5">
        {rotulo && (
          <label
            htmlFor={idCampo}
            className="block text-xs font-semibold uppercase tracking-wider text-night-300"
          >
            {rotulo}
          </label>
        )}

        <div className="relative flex items-center">
          {iconeEsquerda && (
            <div className="pointer-events-none absolute left-3.5 text-night-400">
              {iconeEsquerda}
            </div>
          )}

          <input
            id={idCampo}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-night-950/90 px-4 py-2.5 text-sm text-white placeholder:text-night-400/70 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-fire-500/40 focus:border-fire-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              erro
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30'
                : 'border-night-700 hover:border-night-600',
              iconeEsquerda && 'pl-10',
              elementoDireita && 'pr-11',
              className
            )}
            aria-invalid={Boolean(erro)}
            {...props}
          />

          {elementoDireita && (
            <div className="absolute right-3 flex items-center">
              {elementoDireita}
            </div>
          )}
        </div>

        {erro ? (
          <p className="text-xs font-medium text-red-400" role="alert">
            {erro}
          </p>
        ) : dica ? (
          <p className="text-xs text-night-400">{dica}</p>
        ) : null}
      </div>
    );
  }
);

CampoTexto.displayName = 'CampoTexto';
