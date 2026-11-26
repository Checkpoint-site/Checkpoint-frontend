import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import {
  EVENTO_MUDANCA_AUTENTICACAO,
  decodificarPayloadToken,
  possuiToken,
  removerToken,
} from '@shared/lib';
import { Botao } from '@shared/ui';

export const Header: React.FC = () => {
  const navegar = useNavigate();
  const [autenticado, setAutenticado] = useState<boolean>(() => possuiToken());
  const payload = decodificarPayloadToken();

  useEffect(() => {
    const sincronizarAutenticacao = () => setAutenticado(possuiToken());
    window.addEventListener(EVENTO_MUDANCA_AUTENTICACAO, sincronizarAutenticacao);
    window.addEventListener('storage', sincronizarAutenticacao);
    return () => {
      window.removeEventListener(EVENTO_MUDANCA_AUTENTICACAO, sincronizarAutenticacao);
      window.removeEventListener('storage', sincronizarAutenticacao);
    };
  }, []);

  const lidarComSaida = () => {
    removerToken();
    navegar(ROTAS.LOGIN);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-night-700/80 bg-night-950/85 backdrop-blur-md px-4 sm:px-10 py-3.5">
      <div className="w-full flex items-center justify-between">
        <Link
          to={ROTAS.INICIO}
          className="flex items-center gap-2.5 sm:gap-3 text-lg font-extrabold text-white hover:text-ember-400 transition-colors"
        >
          <img
            src="/Images/Icone.png"
            alt="Checkpoint"
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="tracking-tight">Checkpoint</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <Link
            to={ROTAS.INICIO}
            className="px-2.5 py-1.5 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors"
          >
            Início
          </Link>

          <Link
            to={ROTAS.PERFIL}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors font-medium"
          >
            <span>Perfil</span>
          </Link>

          {autenticado ? (
            <div className="flex items-center gap-2.5 sm:gap-3 pl-2 border-l border-night-800">
              <Link
                to={ROTAS.PERFIL}
                className="hidden md:flex items-center gap-2 text-xs text-ember-400 font-semibold hover:text-ember-300 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-fire-600/30 text-fire-400 flex items-center justify-center text-[10px] font-bold border border-fire-500/40">
                  {payload?.email ? payload.email[0].toUpperCase() : 'U'}
                </div>
                <span>{payload?.email}</span>
              </Link>
              <Botao variante="contorno" tamanho="pequeno" onClick={lidarComSaida}>
                Sair
              </Botao>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-night-800">
              <Link to={ROTAS.LOGIN}>
                <Botao variante="fantasma" tamanho="pequeno">
                  Entrar
                </Botao>
              </Link>
              <Link to={ROTAS.CADASTRO}>
                <Botao variante="primario" tamanho="pequeno">
                  Criar Conta
                </Botao>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
