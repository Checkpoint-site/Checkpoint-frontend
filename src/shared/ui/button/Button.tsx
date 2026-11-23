import React from 'react';
import { cn } from '@shared/lib';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'contorno' | 'fantasma';
  tamanho?: 'pequeno' | 'medio' | 'grande';
  carregando?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variante = 'primario',
      tamanho = 'medio',
      carregando = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantes = {
      primario:
        'bg-linear-to-r from-fire-600 via-fire-500 to-ember-500 hover:from-fire-500 hover:via-fire-400 hover:to-ember-400 text-white shadow-lg shadow-fire-500/20 border border-ember-400/20',
      secundario:
        'bg-night-800 hover:bg-night-700 text-white border border-night-700',
      contorno:
        'bg-transparent border border-night-600 hover:border-fire-500/60 hover:bg-night-800/80 text-white',
      fantasma:
        'bg-transparent hover:bg-night-800 text-night-300 hover:text-white',
    };

    const tamanhos = {
      pequeno: 'px-3 py-1.5 text-xs rounded-lg',
      medio: 'px-4 py-2.5 text-sm rounded-xl',
      grande: 'px-6 py-3 text-base rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]',
          variantes[variante],
          tamanhos[tamanho],
          className
        )}
        {...props}
      >
        {carregando && (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export const Botao = Button;
