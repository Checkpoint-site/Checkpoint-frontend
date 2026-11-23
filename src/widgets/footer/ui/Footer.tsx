import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-night-800 bg-night-950 py-6 px-4 text-center text-xs text-night-400">
      Checkpoint &copy; {new Date().getFullYear()} — Sua jornada nos games, registrada.
    </footer>
  );
};
