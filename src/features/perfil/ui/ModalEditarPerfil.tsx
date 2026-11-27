import React, { useState } from 'react';
import { Botao, CampoTexto } from '@shared/ui';
import type { PerfilUsuario } from '../model/tipos';

interface ModalEditarPerfilProps {
  aberto: boolean;
  perfil: PerfilUsuario;
  aoFechar: () => void;
  aoSalvar: (novosDados: Partial<PerfilUsuario>) => void;
}

export const ModalEditarPerfil: React.FC<ModalEditarPerfilProps> = ({
  aberto,
  perfil,
  aoFechar,
  aoSalvar,
}) => {
  const [nome, setNome] = useState(perfil.nome);
  const [fotoPerfil, setFotoPerfil] = useState(perfil.fotoPerfil || '');
  const [biografiaGamer, setBiografiaGamer] = useState(perfil.biografiaGamer || '');
  const [salvando, setSalvando] = useState(false);

  if (!aberto) return null;

  const lidarComSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setTimeout(() => {
      aoSalvar({
        nome,
        fotoPerfil: fotoPerfil.trim() ? fotoPerfil.trim() : null,
        biografiaGamer,
      });
      setSalvando(false);
      aoFechar();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-night-950 border border-night-700/80 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-night-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Editar Perfil Gamer
          </h2>
          <button
            onClick={aoFechar}
            className="text-night-400 hover:text-white text-xl p-1 leading-none"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={lidarComSalvar} className="mt-5 space-y-4">
          <CampoTexto
            rotulo="Nome de Exibição"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome ou gamertag"
            required
          />

          <CampoTexto
            rotulo="URL da Foto de Perfil"
            value={fotoPerfil}
            onChange={(e) => setFotoPerfil(e.target.value)}
            placeholder="https://exemplo.com/sua-foto.jpg"
            dica="Suporta URL ou Base64. Fotos são validadas pelo serviço de moderação."
          />

          {fotoPerfil && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-night-900 border border-night-800">
              <img
                src={fotoPerfil}
                alt="Prévia"
                className="h-12 w-12 rounded-full object-cover border border-fire-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/150?text=Invalida';
                }}
              />
              <span className="text-xs text-night-300">
                Prévia do novo avatar
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-night-300 mb-1.5">
              Biografia Gamer
            </label>
            <textarea
              value={biografiaGamer}
              onChange={(e) => setBiografiaGamer(e.target.value)}
              rows={3}
              placeholder="Fale um pouco sobre seus jogos favoritos, platinas e estilo de jogo..."
              className="w-full bg-night-900 border border-night-700 rounded-lg p-3 text-sm text-white placeholder-night-500 focus:outline-none focus:border-fire-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-night-800">
            <Botao
              type="button"
              variante="fantasma"
              tamanho="pequeno"
              onClick={aoFechar}
            >
              Cancelar
            </Botao>
            <Botao
              type="submit"
              variante="primario"
              tamanho="pequeno"
              carregando={salvando}
            >
              Salvar Alterações
            </Botao>
          </div>
        </form>
      </div>
    </div>
  );
};
