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
    <header className="sticky top-0 z-50 border-b border-night-700/80 bg-night-950/85 backdrop-blur-md px-6 sm:px-10 py-3.5">
      <div className="w-full flex items-center justify-between">
        <Link
          to={ROTAS.INICIO}
          className="flex items-center gap-3 text-lg font-extrabold text-white hover:text-ember-400 transition-colors"
        >
          <img
            src="/Images/Icone.png"
            alt="Checkpoint"
            className="h-9 w-9 object-contain"
          />
          <span>Checkpoint</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            to={ROTAS.INICIO}
            className="px-3 py-1.5 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors"
          >
            Início
          </Link>

          {autenticado ? (
            <div className="flex items-center gap-3">
              {payload?.email && (
                <span className="hidden sm:inline-block text-xs text-ember-400 font-medium">
                  {payload.email}
                </span>
              )}
              <Botao variante="contorno" tamanho="pequeno" onClick={lidarComSaida}>
                Sair
              </Botao>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
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
