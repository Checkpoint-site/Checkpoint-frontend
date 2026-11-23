import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ROTAS } from '@shared/config';
import { Header, Footer } from '@widgets/index';
import { HomePage, PaginaLogin, PaginaCadastro } from '@pages/index';

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

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPrincipal />}>
          <Route path={ROTAS.INICIO} element={<HomePage />} />
          <Route path={ROTAS.LOGIN} element={<PaginaLogin />} />
          <Route path={ROTAS.CADASTRO} element={<PaginaCadastro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
