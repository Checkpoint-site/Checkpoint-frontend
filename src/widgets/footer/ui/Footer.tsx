import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-800 py-6 px-4 text-center text-xs text-neutral-500">
      Checkpoint &copy; {new Date().getFullYear()} — Arquitetura Feature-Sliced Design (FSD)
    </footer>
  );
};
