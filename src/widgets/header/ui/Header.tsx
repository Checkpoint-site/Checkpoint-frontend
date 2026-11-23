import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-lg font-bold text-neutral-100 hover:text-white">
          Checkpoint
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-400">
          <Link to={ROUTES.HOME} className="hover:text-neutral-200">
            Início
          </Link>
        </nav>
      </div>
    </header>
  );
};
