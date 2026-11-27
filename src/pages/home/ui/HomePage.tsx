import React from 'react';
import { useAutenticado } from '@shared/lib';
import { PaginaInicial } from './PaginaInicial';
import { VitrinePrincipal } from './VitrinePrincipal';

export const HomePage: React.FC = () => {
  const autenticado = useAutenticado();
  return autenticado ? <VitrinePrincipal /> : <PaginaInicial />;
};
