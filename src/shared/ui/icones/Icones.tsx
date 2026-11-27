import React, { useId } from 'react';
import urlAvatarAnonimo from './avatar-anonimo.svg';

export interface IconeProps extends React.SVGProps<SVGSVGElement> {
  tamanho?: number;
}

export const URL_AVATAR_ANONIMO: string = urlAvatarAnonimo;

/**
 * Ícone de 3 traços horizontais (Menu Hambúrguer clássico de redes sociais).
 */
export const IconeMenuHamburguer: React.FC<IconeProps> = ({
  tamanho = 22,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <line x1="3.5" y1="6" x2="20.5" y2="6" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
    <line x1="3.5" y1="18" x2="20.5" y2="18" />
  </svg>
);

/**
 * Ícone de Sino (Notificações).
 */
export const IconeSino: React.FC<IconeProps> = ({
  tamanho = 20,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

/**
 * Ícone de Lupa (Pesquisa).
 */
export const IconeLupa: React.FC<IconeProps> = ({
  tamanho = 20,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="11" cy="11" r="7.5" />
    <line x1="20.5" y1="20.5" x2="16.35" y2="16.35" />
  </svg>
);

/**
 * Ícone de Calendário (Filtro por Data).
 */
export const IconeCalendario: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8.5" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="18" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Ícone de Nome / Jogo (Filtro por Nome).
 */
export const IconeNome: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
);

/**
 * Ícone de Autor / Criador (Filtro por Autor).
 */
export const IconeAutor: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
  </svg>
);

/**
 * Ícone de Engrenagem (Configurações).
 */
export const IconeConfiguracoes: React.FC<IconeProps> = ({
  tamanho = 20,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/**
 * Ícone de Usuário (Perfil).
 */
export const IconePerfil: React.FC<IconeProps> = ({
  tamanho = 20,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/**
 * Ícone de Sair / Logout.
 */
export const IconeSair: React.FC<IconeProps> = ({
  tamanho = 20,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/**
 * Ícone de Fechar (X).
 */
export const IconeFechar: React.FC<IconeProps> = ({
  tamanho = 18,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Ícone de 3 Pontinhos Verticais (Menu de opções de post).
 */
export const IconeTresPontos: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="5" r="1.85" />
    <circle cx="12" cy="12" r="1.85" />
    <circle cx="12" cy="19" r="1.85" />
  </svg>
);

/**
 * Ícone de Lixeira (Excluir post / comentário).
 */
export const IconeLixeira: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/**
 * Ícone de Seta para a Esquerda (Chevron).
 */
export const IconeSetaEsquerda: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/**
 * Ícone de Seta para a Direita (Chevron).
 */
export const IconeSetaDireita: React.FC<IconeProps> = ({
  tamanho = 16,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * Ícone de Seta para Baixo (Chevron).
 */
export const IconeSetaBaixo: React.FC<IconeProps> = ({
  tamanho = 14,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * Bonequinho Anônimo em SVG (componente vetorial direto para avatares).
 */
export const IconeBonecoAnonimo: React.FC<IconeProps> = ({
  tamanho = 128,
  className,
  ...props
}) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 160 160"
    fill="none"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <defs>
      <radialGradient id="iconeFundoNoite" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#1e3150" />
        <stop offset="65%" stopColor="#111d27" />
        <stop offset="100%" stopColor="#05080f" />
      </radialGradient>
      <radialGradient id="iconeBrilhoBrasa" cx="50%" cy="95%" r="55%">
        <stop offset="0%" stopColor="#ff6b2b" stopOpacity="0.28" />
        <stop offset="60%" stopColor="#ffb830" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#ff6b2b" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="iconeSilhuetaAnonima"
        x1="80"
        y1="34"
        x2="80"
        y2="156"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#d8e4f8" />
        <stop offset="55%" stopColor="#94add3" />
        <stop offset="100%" stopColor="#5a76a3" />
      </linearGradient>
    </defs>
    <circle cx="80" cy="80" r="80" fill="url(#iconeFundoNoite)" />
    <circle cx="80" cy="80" r="80" fill="url(#iconeBrilhoBrasa)" />
    <circle cx="80" cy="60" r="27" fill="url(#iconeSilhuetaAnonima)" />
    <path
      d="M28 152C28 121.5 50.8 100 80 100C109.2 100 132 121.5 132 152V164H28V152Z"
      fill="url(#iconeSilhuetaAnonima)"
    />
  </svg>
);

/**
 * Ícone de Chama da Fogueira usado nas notas do Checkpoint.
 */
export const IconeChamaNota: React.FC<IconeProps> = ({
  tamanho = 14,
  className,
  ...props
}) => {
  const uid = useId();
  const idExt = `chama-nota-ext-${uid}`;
  const idInt = `chama-nota-int-${uid}`;

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={idExt} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="45%" stopColor="#ff6b2b" />
          <stop offset="80%" stopColor="#ffb830" />
          <stop offset="100%" stopColor="#ffe58f" />
        </linearGradient>
        <linearGradient id={idInt} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#ff8c42" />
          <stop offset="60%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#fffbeb" />
        </linearGradient>
      </defs>
      <path
        d="M12.2 2C12.8 5.8 9.9 7.8 9.6 10.6C8.5 9.8 7.9 8.5 8 7.2C5.5 9.2 4.2 12.1 4.2 14.8C4.2 19 7.6 22 12 22C16.4 22 19.8 18.8 19.8 14.4C19.8 10.2 16.9 6.6 14.8 4.4C14.7 6.3 13.7 7.6 12.7 8.4C13.6 6.1 13.4 3.8 12.2 2Z"
        fill={`url(#${idExt})`}
      />
      <path
        d="M12.1 10.8C12.3 12.7 10.8 13.8 10.8 15.6C10.8 17.5 11.7 18.9 12.6 19.2C14.4 18.8 15.7 17.1 15.7 15.1C15.7 13.1 14.1 11.6 12.1 10.8Z"
        fill={`url(#${idInt})`}
        opacity="0.92"
      />
    </svg>
  );
};
