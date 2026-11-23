import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { Botao, CampoTexto } from '@shared/ui';
import { autenticacaoApi } from '../api/autenticacaoApi';

type EtapaCadastro = 'dados' | 'codigo';

export const FormularioCadastro: React.FC = () => {
  const navegar = useNavigate();

  const [etapa, setEtapa] = useState<EtapaCadastro>('dados');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailDisponivel, setEmailDisponivel] = useState<boolean | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<{
    nome?: string;
    email?: string;
    senha?: string;
    codigo?: string;
  }>({});

  const padraoEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const lidarComVerificacaoEmail = async () => {
    const emailLimpo = email.trim();
    if (!emailLimpo || !padraoEmailValido.test(emailLimpo)) {
      setEmailDisponivel(null);
      return;
    }

    setVerificandoEmail(true);
    try {
      const resultado = await autenticacaoApi.verificarDisponibilidadeEmail({
        email: emailLimpo,
      });
      setEmailDisponivel(resultado.disponivel);
      if (!resultado.disponivel) {
        setErrosCampos((anterior) => ({
          ...anterior,
          email: 'Este e-mail já está em uso na comunidade.',
        }));
      } else {
        setErrosCampos((anterior) => ({ ...anterior, email: undefined }));
      }
    } catch {
      setEmailDisponivel(null);
    } finally {
      setVerificandoEmail(false);
    }
  };

  const validarEtapaDados = (): boolean => {
    const novosErros: { nome?: string; email?: string; senha?: string } = {};
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo) {
      novosErros.nome = 'O nome é obrigatório.';
    } else if (nomeLimpo.length > 100) {
      novosErros.nome = 'O nome deve ter no máximo 100 caracteres.';
    }

    if (!emailLimpo) {
      novosErros.email = 'O e-mail é obrigatório.';
    } else if (!padraoEmailValido.test(emailLimpo)) {
      novosErros.email = 'Informe um endereço de e-mail válido.';
    } else if (emailLimpo.length > 254) {
      novosErros.email = 'O e-mail deve ter no máximo 254 caracteres.';
    }

    if (!senha) {
      novosErros.senha = 'A senha é obrigatória.';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter no mínimo 6 caracteres.';
    }

    setErrosCampos(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const lidarComSolicitacaoCodigo = async (
    evento: React.FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();
    setErroGeral(null);
    setMensagemSucesso(null);

    if (!validarEtapaDados()) return;

    setCarregando(true);
    try {
      const emailLimpo = email.trim();
      const disponibilidade = await autenticacaoApi.verificarDisponibilidadeEmail({
        email: emailLimpo,
      });

      if (!disponibilidade.disponivel) {
        setEmailDisponivel(false);
        setErrosCampos((anterior) => ({
          ...anterior,
          email: 'Este e-mail já está em uso.',
        }));
        setCarregando(false);
        return;
      }

      const resposta = await autenticacaoApi.solicitarCodigo({ email: emailLimpo });
      setMensagemSucesso(
        resposta.mensagem || 'Código de 6 dígitos enviado para o seu e-mail!'
      );
      setEtapa('codigo');
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Erro ao solicitar código de verificação.';
      setErroGeral(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const lidarComReenvioCodigo = async () => {
    setErroGeral(null);
    setMensagemSucesso(null);
    setCarregando(true);
    try {
      const resposta = await autenticacaoApi.solicitarCodigo({ email: email.trim() });
      setMensagemSucesso(
        resposta.mensagem || 'Novo código enviado para o seu e-mail.'
      );
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível reenviar o código.';
      setErroGeral(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const lidarComConclusaoCadastro = async (
    evento: React.FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();
    setErroGeral(null);

    const codigoLimpo = codigo.trim();
    if (!/^\d{6}$/.test(codigoLimpo)) {
      setErrosCampos((anterior) => ({
        ...anterior,
        codigo:
          'O código de verificação deve conter exatamente 6 dígitos numéricos.',
      }));
      return;
    }

    setCarregando(true);
    try {
      await autenticacaoApi.cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        codigo: codigoLimpo,
      });

      navegar(ROTAS.INICIO);
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Erro ao concluir cadastro. Verifique o código informado.';
      setErroGeral(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Indicador de Etapas */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            etapa === 'dados' || etapa === 'codigo'
              ? 'bg-linear-to-r from-fire-500 to-ember-400'
              : 'bg-night-700'
          }`}
        />
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            etapa === 'codigo'
              ? 'bg-linear-to-r from-fire-500 to-ember-400'
              : 'bg-night-700'
          }`}
        />
      </div>

      {erroGeral && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200 flex items-start gap-3"
        >
          <span className="text-red-400 font-bold">!</span>
          <span>{erroGeral}</span>
        </div>
      )}

      {mensagemSucesso && (
        <div
          role="status"
          className="rounded-xl border border-ember-400/40 bg-night-950/80 px-4 py-3 text-sm text-ember-300 flex items-start gap-3"
        >
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {etapa === 'dados' ? (
        <form onSubmit={lidarComSolicitacaoCodigo} className="space-y-4" noValidate>
          <CampoTexto
            rotulo="Nome ou Apelido no Checkpoint"
            type="text"
            name="nome"
            autoComplete="name"
            placeholder="Ex: JogadorUm"
            maxLength={100}
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              if (errosCampos.nome) {
                setErrosCampos((anterior) => ({ ...anterior, nome: undefined }));
              }
            }}
            erro={errosCampos.nome}
          />

          <CampoTexto
            rotulo="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@checkpoint.gg"
            maxLength={254}
            value={email}
            onBlur={lidarComVerificacaoEmail}
            onChange={(evento) => {
              setEmail(evento.target.value);
              setEmailDisponivel(null);
              if (errosCampos.email) {
                setErrosCampos((anterior) => ({ ...anterior, email: undefined }));
              }
            }}
            erro={errosCampos.email}
            dica={
              verificandoEmail
                ? 'Verificando disponibilidade...'
                : emailDisponivel === true
                  ? '✓ E-mail disponível para cadastro'
                  : undefined
            }
          />

          <CampoTexto
            rotulo="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            name="senha"
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            value={senha}
            onChange={(evento) => {
              setSenha(evento.target.value);
              if (errosCampos.senha) {
                setErrosCampos((anterior) => ({ ...anterior, senha: undefined }));
              }
            }}
            erro={errosCampos.senha}
            dica="Use pelo menos 6 caracteres para proteger seu progresso."
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

          <Botao
            type="submit"
            variante="primario"
            tamanho="grande"
            carregando={carregando}
            className="w-full mt-2"
          >
            {carregando
              ? 'Enviando código de verificação...'
              : 'Continuar e Receber Código'}
          </Botao>
        </form>
      ) : (
        <form
          onSubmit={lidarComConclusaoCadastro}
          className="space-y-5"
          noValidate
        >
          <div className="rounded-xl border border-night-700 bg-night-950/60 p-4 text-xs text-night-300 space-y-1">
            <p>
              Enviamos um código numérico de <strong className="text-white">6 dígitos</strong> para:
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-ember-400 truncate">
                {email}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEtapa('dados');
                  setErroGeral(null);
                  setMensagemSucesso(null);
                }}
                className="text-xs font-medium text-night-300 hover:text-white underline cursor-pointer"
              >
                Alterar e-mail
              </button>
            </div>
          </div>

          <CampoTexto
            rotulo="Código de Verificação (6 dígitos)"
            type="text"
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={codigo}
            onChange={(evento) => {
              const apenasDigitos = evento.target.value.replace(/\D/g, '').slice(0, 6);
              setCodigo(apenasDigitos);
              if (errosCampos.codigo) {
                setErrosCampos((anterior) => ({ ...anterior, codigo: undefined }));
              }
            }}
            erro={errosCampos.codigo}
            className="text-center text-lg tracking-[0.5em] font-mono font-bold"
          />

          <div className="flex flex-col gap-3">
            <Botao
              type="submit"
              variante="primario"
              tamanho="grande"
              carregando={carregando}
              className="w-full"
            >
              {carregando
                ? 'Validando e criando conta...'
                : 'Acender Fogueira e Criar Conta'}
            </Botao>

            <Botao
              type="button"
              variante="fantasma"
              tamanho="pequeno"
              disabled={carregando}
              onClick={lidarComReenvioCodigo}
              className="w-full"
            >
              Não recebeu o e-mail? Reenviar código
            </Botao>
          </div>
        </form>
      )}

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-night-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-night-800 px-3 text-night-400">
            Já faz parte da jornada?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-night-300">
        Já possui uma conta no Checkpoint?{' '}
        <Link
          to={ROTAS.LOGIN}
          className="font-semibold text-ember-400 hover:text-fire-400 underline-offset-4 hover:underline transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
};
