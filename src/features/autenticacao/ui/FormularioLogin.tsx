import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { Botao, CampoTexto } from '@shared/ui';
import { autenticacaoApi } from '../api/autenticacaoApi';

export const FormularioLogin: React.FC = () => {
  const navegar = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<{
    email?: string;
    senha?: string;
  }>({});

  const validarFormulario = (): boolean => {
    const novosErros: { email?: string; senha?: string } = {};
    const emailLimpo = email.trim();

    if (!emailLimpo) {
      novosErros.email = 'É necessário informar o endereço de Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      novosErros.email = 'Informe um endereço de Email válido';
    }

    if (!senha) {
      novosErros.senha = 'É necessário informar a senha';
    }

    setErrosCampos(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const lidarComEnvio = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErroGeral(null);

    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      await autenticacaoApi.autenticar({
        email: email.trim(),
        senha,
      });

      navegar(ROTAS.INICIO);
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível realizar o login. Tente novamente.';
      setErroGeral(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={lidarComEnvio} className="space-y-5" noValidate>
      {erroGeral && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200 flex items-start gap-3"
        >
          <span className="text-red-400 font-bold">!</span>
          <span>{erroGeral}</span>
        </div>
      )}

      <CampoTexto
        rotulo="E-mail da Conta"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="voce@checkpoint.gg"
        value={email}
        onChange={(evento) => {
          setEmail(evento.target.value);
          if (errosCampos.email) {
            setErrosCampos((anterior) => ({ ...anterior, email: undefined }));
          }
        }}
        erro={errosCampos.email}
      />

      <div className="space-y-1.5">
        <CampoTexto
          rotulo="Senha"
          type={mostrarSenha ? 'text' : 'password'}
          name="senha"
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(evento) => {
            setSenha(evento.target.value);
            if (errosCampos.senha) {
              setErrosCampos((anterior) => ({ ...anterior, senha: undefined }));
            }
          }}
          erro={errosCampos.senha}
          elementoDireita={
            <button
              type="button"
              onClick={() => setMostrarSenha((anterior) => !anterior)}
              className="text-xs font-medium text-night-300 hover:text-ember-400 transition-colors cursor-pointer"
            >
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          }
        />
      </div>

      <Botao
        type="submit"
        variante="primario"
        tamanho="grande"
        carregando={carregando}
        className="w-full"
      >
        {carregando ? 'Autenticando na fogueira...' : 'Entrar no Checkpoint'}
      </Botao>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-night-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-night-800 px-3 text-night-400">
            Novo na comunidade?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-night-300">
        Ainda não tem um perfil?{' '}
        <Link
          to={ROTAS.CADASTRO}
          className="font-semibold text-ember-400 hover:text-fire-400 underline-offset-4 hover:underline transition-colors"
        >
          Criar conta gratuita
        </Link>
      </p>
    </form>
  );
};
