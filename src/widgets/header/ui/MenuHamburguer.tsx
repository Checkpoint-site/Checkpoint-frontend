import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { cn } from '@shared/lib';
import {
  IconeConfiguracoes,
  IconeFechar,
  IconeMenuHamburguer,
  IconePerfil,
  IconeSair,
  IconeSetaDireita,
  URL_AVATAR_ANONIMO,
} from '@shared/ui';

export interface MenuHamburguerProps {
  emailUsuario?: string;
  nomeUsuario?: string;
  urlFotoPerfil?: string;
  aoSair: () => void;
  aoAbrir?: () => void;
}

export const MenuHamburguer: React.FC<MenuHamburguerProps> = ({
  emailUsuario,
  nomeUsuario,
  urlFotoPerfil,
  aoSair,
  aoAbrir,
}) => {
  const [aberto, setAberto] = useState(false);
  const [avisoSecao, setAvisoSecao] = useState<string | null>(null);

  const nomeExibicao =
    nomeUsuario ||
    (emailUsuario ? emailUsuario.split('@')[0] : 'Viajante Anônimo');

  useEffect(() => {
    if (!aberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const lidarEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAberto(false);
        setAvisoSecao(null);
      }
    };

    document.addEventListener('keydown', lidarEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', lidarEscape);
    };
  }, [aberto]);

  const abrirMenu = () => {
    setAvisoSecao(null);
    setAberto(true);
    aoAbrir?.();
  };

  const fecharMenu = () => {
    setAberto(false);
    setAvisoSecao(null);
  };

  const confirmarSaida = () => {
    fecharMenu();
    aoSair();
  };

  return (
    <>
      <button
        type="button"
        onClick={abrirMenu}
        aria-label="Abrir menu"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer',
          aberto
            ? 'border-fire-500/60 bg-night-800 text-ember-400 shadow-[0_0_16px_rgba(255,107,43,0.28)]'
            : 'border-night-700/80 bg-night-900/70 text-night-200 hover:border-fire-500/50 hover:bg-night-800/90 hover:text-ember-400 hover:shadow-[0_0_14px_rgba(255,107,43,0.22)]'
        )}
      >
        <IconeMenuHamburguer tamanho={21} />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden={!aberto}
            className={cn(
              'fixed inset-0 z-100 transition-visibility duration-300',
              aberto
                ? 'pointer-events-auto visible'
                : 'pointer-events-none invisible'
            )}
          >
            {/* Fundo escurecido com desfoque */}
            <div
              onClick={fecharMenu}
              className={cn(
                'absolute inset-0 bg-night-950/75 backdrop-blur-xs transition-opacity duration-300',
                aberto ? 'opacity-100' : 'opacity-0'
              )}
            />

            {/* Gaveta lateral estilo rede social */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu da conta"
              className={cn(
                'absolute inset-y-0 right-0 flex w-80 max-w-[88vw] sm:w-96 flex-col justify-between border-l border-night-700/90 bg-night-900/98 p-6 text-white shadow-2xl shadow-black/80 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                aberto ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              {/* Seção Superior: Cabeçalho + Avatar Circular Grande + Opções */}
              <div className="flex flex-col">
                {/* Topo da Gaveta */}
                <div className="flex items-center justify-between pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-night-400">
                    Menu
                  </span>
                  <button
                    type="button"
                    onClick={fecharMenu}
                    aria-label="Fechar menu"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-night-700/80 bg-night-800/70 text-night-300 hover:border-fire-500/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <IconeFechar tamanho={18} />
                  </button>
                </div>

                {/* Avatar Circular Grande com Bonequinho Anônimo Default */}
                <div className="relative flex flex-col items-center py-5 text-center">
                  <div
                    className="pointer-events-none absolute top-3 h-36 w-36 rounded-full bg-fire-500/15 blur-2xl"
                    aria-hidden="true"
                  />

                  <div className="relative rounded-full bg-linear-to-tr from-fire-600 via-ember-400 to-fire-400 p-1 shadow-[0_0_30px_rgba(255,107,43,0.3)]">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-night-950 bg-night-950">
                      <img
                        src={urlFotoPerfil || URL_AVATAR_ANONIMO}
                        alt="Avatar do usuário"
                        className="h-full w-full rounded-full object-cover select-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-0.5">
                    <p className="text-base font-extrabold tracking-tight text-white">
                      {nomeExibicao}
                    </p>
                    {emailUsuario && (
                      <p className="text-xs font-medium text-ember-400 break-all">
                        {emailUsuario}
                      </p>
                    )}
                  </div>
                </div>

                <div className="my-3 border-t border-night-800" />

                {/* Opções Superiores: Configurações em cima e Perfil */}
                <nav
                  aria-label="Opções da conta"
                  className="flex flex-col gap-2 pt-1"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAvisoSecao(
                        'A área de Configurações estará disponível em breve.'
                      )
                    }
                    className="group flex w-full items-center justify-between rounded-2xl border border-night-800 bg-night-950/60 px-4 py-3.5 text-left transition-all duration-200 hover:border-fire-500/40 hover:bg-night-800/90 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-700/80 bg-night-900 text-night-300 group-hover:border-fire-500/40 group-hover:text-ember-400 transition-colors">
                        <IconeConfiguracoes tamanho={20} />
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-ember-300 transition-colors">
                          Configurações
                        </span>
                        <span className="block text-[11px] text-night-400">
                          Preferências, segurança e conta
                        </span>
                      </div>
                    </div>
                    <IconeSetaDireita
                      tamanho={16}
                      className="text-night-400 group-hover:translate-x-0.5 group-hover:text-ember-400 transition-all"
                    />
                  </button>

                  <Link
                    to={ROTAS.PERFIL}
                    onClick={fecharMenu}
                    className="group flex w-full items-center justify-between rounded-2xl border border-night-800 bg-night-950/60 px-4 py-3.5 text-left transition-all duration-200 hover:border-fire-500/40 hover:bg-night-800/90 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-700/80 bg-night-900 text-night-300 group-hover:border-fire-500/40 group-hover:text-ember-400 transition-colors">
                        <IconePerfil tamanho={20} />
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-white group-hover:text-ember-300 transition-colors">
                          Perfil
                        </span>
                        <span className="block text-[11px] text-night-400">
                          Sua coleção, análises e jornada
                        </span>
                      </div>
                    </div>
                    <IconeSetaDireita
                      tamanho={16}
                      className="text-night-400 group-hover:translate-x-0.5 group-hover:text-ember-400 transition-all"
                    />
                  </Link>
                </nav>

                {avisoSecao && (
                  <p
                    role="status"
                    className="mt-3 rounded-xl border border-ember-400/25 bg-night-950/80 px-3.5 py-2.5 text-xs text-ember-300 animar-entrada-painel"
                  >
                    {avisoSecao}
                  </p>
                )}
              </div>

              {/* Rodapé da Gaveta: Sair lá no fim */}
              <div className="border-t border-night-800 pt-4">
                <button
                  type="button"
                  onClick={confirmarSaida}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-night-700 bg-night-950/80 px-4 py-3 text-sm font-bold text-night-200 transition-all duration-200 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
                >
                  <IconeSair
                    tamanho={19}
                    className="text-night-300 group-hover:text-red-400 transition-colors"
                  />
                  <span>Sair</span>
                </button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
};
