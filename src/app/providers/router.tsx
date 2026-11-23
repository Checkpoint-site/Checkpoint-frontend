import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { Header, Footer } from '@widgets/index';
import { HomePage } from '@pages/index';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100">
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
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
