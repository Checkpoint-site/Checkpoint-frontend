import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { useAutenticado } from '@shared/lib';
import { Header, Footer } from '@widgets/index';
import {
  HomePage,
  PaginaLogin,
  PaginaCadastro,
  PaginaJogo,
  PaginaAvaliacao,
  PaginaReview,
} from '@pages/index';

const LayoutVitrine: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-white">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const LayoutPrincipal: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-night-900 text-white">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const RotaPrivada: React.FC = () => {
  const autenticado = useAutenticado();
  if (!autenticado) {
    return <Navigate to={ROTAS.LOGIN} replace />;
  }
  return <Outlet />;
};

const RotaVisitante: React.FC = () => {
  const autenticado = useAutenticado();
  if (autenticado) {
    return <Navigate to={ROTAS.INICIO} replace />;
  }
  return <Outlet />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutVitrine />}>
          <Route path={ROTAS.INICIO} element={<HomePage />} />
          <Route element={<RotaPrivada />}>
            <Route path={ROTAS.JOGO} element={<PaginaJogo />} />
            <Route path={ROTAS.AVALIAR_JOGO} element={<PaginaAvaliacao />} />
            <Route path={ROTAS.REVIEW} element={<PaginaReview />} />
          </Route>
        </Route>
        <Route element={<LayoutPrincipal />}>
          <Route element={<RotaVisitante />}>
            <Route path={ROTAS.LOGIN} element={<PaginaLogin />} />
            <Route path={ROTAS.CADASTRO} element={<PaginaCadastro />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROTAS.INICIO} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
