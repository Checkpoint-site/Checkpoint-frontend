import React from 'react';
import { Button } from '@shared/ui';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-100">
          Checkpoint
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl mx-auto">
          Esqueleto inicial configurado com Vite, React, TypeScript, Tailwind CSS e Feature-Sliced Design (FSD).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary">Começar</Button>
        <Button variant="outline">Documentação</Button>
      </div>
    </div>
  );
};
