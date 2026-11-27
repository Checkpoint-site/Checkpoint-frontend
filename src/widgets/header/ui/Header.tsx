import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarraPesquisaExpansivel } from '@features/index';
import { ROTAS } from '@shared/config';
import {
  cn,
  decodificarPayloadToken,
  removerToken,
  useAutenticado,
} from '@shared/lib';
import { Botao } from '@shared/ui';
import { BotaoNotificacoes } from './BotaoNotificacoes';
import { MenuHamburguer } from './MenuHamburguer';

export const Header: React.FC = () => {
  const navegar = useNavigate();
  const localizacao = useLocation();
  const autenticado = useAutenticado();
  const [pesquisaExpandida, setPesquisaExpandida] = useState(false);
  const payload = autenticado ? decodificarPayloadToken() : null;

  const emPaginaAutenticacao =
    localizacao.pathname === ROTAS.LOGIN || localizacao.pathname === ROTAS.CADASTRO;
  const exibirAreaPrincipal = autenticado && !emPaginaAutenticacao;
  const emInicio = localizacao.pathname === ROTAS.INICIO;

  const obterHrefSecao = (ancora: string) =>
    emInicio ? ancora : `${ROTAS.INICIO}${ancora}`;

  const lidarComSaida = () => {
    setPesquisaExpandida(false);
    removerToken();
    navegar(ROTAS.LOGIN);
  };

  if (!exibirAreaPrincipal) {
    return (
      <header className="sticky top-0 z-50 border-b border-night-700/80 bg-night-950/85 backdrop-blur-md px-6 sm:px-10 py-3.5">
        <div className="w-full flex items-center justify-between gap-4">
          <Link
            to={ROTAS.INICIO}
            className="flex shrink-0 items-center gap-3 text-lg font-extrabold text-white hover:text-ember-400 transition-colors"
          >
            <img
              src="/Images/Icone.png"
              alt="Checkpoint"
              className="h-9 w-9 object-contain"
            />
            <span>Checkpoint</span>
          </Link>

          <nav aria-label="Navegação inicial" className="flex items-center gap-3 text-sm">
            <Link
              to={ROTAS.INICIO}
              className="px-3 py-1.5 rounded-lg text-night-300 hover:text-white hover:bg-night-800 transition-colors"
            >
              Início
            </Link>
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
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-night-700/80 bg-night-950/85 backdrop-blur-md px-6 sm:px-10 py-3.5">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link
            to={ROTAS.INICIO}
            className="flex shrink-0 items-center gap-3 text-lg font-extrabold text-white hover:text-ember-400 transition-colors"
          >
            <img
              src="/Images/Icone.png"
              alt="Checkpoint"
              className="h-9 w-9 object-contain"
            />
            <span>Checkpoint</span>
          </Link>

          <nav
            aria-label="Navegação principal"
            className={cn(
              'items-center gap-1 lg:gap-2 text-sm font-medium whitespace-nowrap',
              pesquisaExpandida ? 'hidden' : 'hidden md:flex'
            )}
          >
            <Link
              to={ROTAS.INICIO}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap',
                emInicio
                  ? 'text-white bg-night-800/80 border border-night-700/70'
                  : 'text-night-300 hover:text-white hover:bg-night-800/60'
              )}
            >
              Início
            </Link>
            <a
              href={obterHrefSecao('#explorar-generos')}
              className="rounded-lg px-3 py-1.5 text-night-300 hover:text-white hover:bg-night-800/60 transition-colors whitespace-nowrap"
            >
              Explorar
            </a>
            <a
              href={obterHrefSecao('#secao-top-10-fogueira')}
              className="rounded-lg px-3 py-1.5 text-night-300 hover:text-white hover:bg-night-800/60 transition-colors whitespace-nowrap"
            >
              Top 10
            </a>
            <a
              href={obterHrefSecao('#secao-reviews-comunidade')}
              className="rounded-lg px-3 py-1.5 text-night-300 hover:text-white hover:bg-night-800/60 transition-colors whitespace-nowrap"
            >
              Comunidade
            </a>
            <a
              href={obterHrefSecao('#secao-minha-estante')}
              className="rounded-lg px-3 py-1.5 text-night-300 hover:text-white hover:bg-night-800/60 transition-colors whitespace-nowrap"
            >
              Minha Estante
            </a>
            <Link
              to={ROTAS.PERFIL}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap font-medium',
                localizacao.pathname === ROTAS.PERFIL
                  ? 'text-white bg-night-800/80 border border-night-700/70'
                  : 'text-night-300 hover:text-white hover:bg-night-800/60'
              )}
            >
              Perfil
            </Link>
          </nav>
        </div>

        <nav
          className={cn(
            'flex items-center justify-end gap-2.5 sm:gap-3 text-sm',
            pesquisaExpandida && 'flex-1 min-w-0'
          )}
        >
          {/* Lupinha com expansão animada e 3 opções (Nome, Data com Calendário, Autor) */}
          <BarraPesquisaExpansivel aoAlterarExpansao={setPesquisaExpandida} />

          <div className="flex items-center gap-2.5">
            {/* Sino de Notificações ao lado do menu */}
            <BotaoNotificacoes />

            {/* Menu Hambúrguer (3 traços) no lugar do antigo botão Sair */}
            <MenuHamburguer
              emailUsuario={payload?.email}
              nomeUsuario={payload?.unique_name}
              aoSair={lidarComSaida}
            />
          </div>
        </nav>
      </div>
    </header>
  );
};
