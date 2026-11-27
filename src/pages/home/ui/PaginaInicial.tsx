import React from 'react';
import { Link } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { Botao } from '@shared/ui';

export const PaginaInicial: React.FC = () => {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl flex-col items-center justify-center overflow-hidden px-6 py-12 text-center space-y-8">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-fire-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-center">
        <span
          className="pointer-events-none absolute -left-2 bottom-3 h-2 w-2 rounded-full bg-ember-300 shadow-[0_0_8px_#ffb830] animar-faisca-1"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-2 bottom-4 h-2 w-2 rounded-full bg-fire-400 shadow-[0_0_8px_#ff6b2b] animar-faisca-2"
          aria-hidden="true"
        />
        <img
          src="/Images/Icone.png"
          alt="Logo Checkpoint"
          className="relative h-28 w-28 object-contain select-none animar-fogo-png"
        />
      </div>

      <div className="relative z-10 space-y-3 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Descanse na{' '}
          <span className="bg-linear-to-r from-fire-400 via-ember-400 to-ember-300 bg-clip-text text-transparent">
            Fogueira
          </span>
        </h1>
        <p className="text-base sm:text-lg text-night-300 max-w-xl mx-auto">
          Descubra, registre, avalie e compartilhe os jogos que marcaram você em
          uma comunidade feita de jogadores para jogadores.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        <Link to={ROTAS.CADASTRO}>
          <Botao variante="primario" tamanho="grande">
            Criar Conta
          </Botao>
        </Link>
        <Link to={ROTAS.LOGIN}>
          <Botao variante="contorno" tamanho="grande">
            Já tenho conta (Entrar)
          </Botao>
        </Link>
      </div>
    </div>
  );
};
