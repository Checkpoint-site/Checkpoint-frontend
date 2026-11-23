import React from 'react';
import { Link } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { VitrineSocialAutenticacao, FormularioLogin } from '@features/index';

export const PaginaLogin: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <VitrineSocialAutenticacao />

        <div className="flex flex-col justify-center rounded-3xl border border-night-700/80 bg-night-800/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Abas estilo Rede Social (Entrar / Criar Conta) */}
          <div className="mb-7 flex rounded-xl border border-night-700 bg-night-950/80 p-1">
            <Link
              to={ROTAS.LOGIN}
              className="flex-1 rounded-lg bg-linear-to-r from-fire-600 to-ember-500 py-2 text-center text-xs font-bold uppercase tracking-wider text-white shadow"
            >
              Entrar
            </Link>
            <Link
              to={ROTAS.CADASTRO}
              className="flex-1 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider text-night-300 hover:text-white transition-colors"
            >
              Criar Conta
            </Link>
          </div>

          <div className="mb-6 space-y-1.5">
            <div className="flex items-center gap-3 lg:hidden mb-3">
              <img
                src="/Images/Icone.png"
                alt="Logo Checkpoint"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg font-extrabold text-white">
                Checkpoint
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Bem-vindo de volta à fogueira
            </h1>
            <p className="text-sm text-night-300">
              Entre com suas credenciais para acessar seu diário de jogos e as
              atividades da comunidade.
            </p>
          </div>

          <FormularioLogin />
        </div>
      </div>
    </div>
  );
};
