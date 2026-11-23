import React from 'react';

const PASSOS_CHECKPOINT = [
  {
    numero: '01',
    titulo: 'Descanse na fogueira',
    descricao:
      'Seu espaço para pausar entre uma partida e outra e organizar tudo o que você joga.',
  },
  {
    numero: '02',
    titulo: 'Salve seu progresso',
    descricao:
      'Registre jogos zerados, notas, lista de pendentes e diário sincronizados com o catálogo da Steam.',
  },
  {
    numero: '03',
    titulo: 'Compartilhe sua jornada',
    descricao:
      'Publique análises, monte listas temáticas e acompanhe as atividades da comunidade.',
  },
] as const;

export const VitrineSocialAutenticacao: React.FC = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl border border-night-700/80 bg-night-800/90 p-10 text-white shadow-2xl">
      {/* Topo: Ícone PNG com contorno de fogo vivo */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3 pt-2">
        <div className="relative flex items-center justify-center">
          {/* Faíscas subindo ao redor da chama PNG */}
          <span
            className="pointer-events-none absolute -left-2 bottom-3 h-1.5 w-1.5 rounded-full bg-ember-300 shadow-[0_0_8px_#ffb830] animar-faisca-1"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-2 bottom-4 h-2 w-2 rounded-full bg-fire-400 shadow-[0_0_8px_#ff6b2b] animar-faisca-2"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute left-1/2 -top-2 h-1.5 w-1.5 rounded-full bg-ember-300 shadow-[0_0_8px_#ffd166] animar-faisca-3"
            aria-hidden="true"
          />

          <img
            src="/Images/Icone.png"
            alt="Logo Checkpoint Fogueira"
            className="relative h-24 w-24 object-contain select-none animar-fogo-png"
          />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Checkpoint
          </h2>
          <p className="text-xs text-night-300 mt-0.5">
            A comunidade para quem vive os jogos
          </p>
        </div>
      </div>

      {/* Centro: Jornada com animação de Pegar Fogo (Chamas + Faíscas) */}
      <div className="relative z-10 my-6 space-y-6 pl-2">
        {/* Linha vertical da trilha da fogueira */}
        <div
          className="pointer-events-none absolute top-4 bottom-4 left-7 w-0.5 bg-linear-to-b from-fire-500/40 via-ember-400/30 to-night-800"
          aria-hidden="true"
        />

        {PASSOS_CHECKPOINT.map((passo) => (
          <div
            key={passo.numero}
            className="group relative flex items-start gap-5 py-2.5 px-3 rounded-2xl transition-colors duration-300"
          >
            {/* Luz suave e difusa de fogueira */}
            <div
              className="pointer-events-none absolute -inset-x-2 inset-y-0 rounded-full bg-linear-to-r from-fire-500/20 via-ember-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-hidden="true"
            />

            {/* Faíscas / Brasas subindo ao passar o mouse */}
            <div
              className="pointer-events-none absolute inset-0 overflow-visible opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-hidden="true"
            >
              <span className="absolute left-7 bottom-4 h-2 w-2 rounded-full bg-ember-300 shadow-[0_0_8px_#ffb830] animar-faisca-1" />
              <span className="absolute left-14 bottom-2 h-1.5 w-1.5 rounded-full bg-fire-400 shadow-[0_0_8px_#ff6b2b] animar-faisca-2" />
              <span className="absolute left-28 bottom-3 h-2 w-2 rounded-full bg-ember-400 shadow-[0_0_10px_#ffb830] animar-faisca-3" />
              <span className="absolute left-48 bottom-2 h-1.5 w-1.5 rounded-full bg-fire-300 shadow-[0_0_8px_#ff6b2b] animar-faisca-4" />
              <span className="absolute right-16 bottom-3 h-2 w-2 rounded-full bg-ember-300 shadow-[0_0_8px_#ffd166] animar-faisca-1" />
            </div>

            {/* Marcador da etapa que pega fogo com labaredas animadas */}
            <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 64 64"
                className="pointer-events-none absolute -top-5 -inset-x-2 h-16 w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 animar-danca-chama"
                aria-hidden="true"
              >
                <path
                  d="M32 4C32 4 14 22 14 39C14 49.5 22 58 32 58C42 58 50 49.5 50 39C50 31 45 23 43 19C43 24 39 27 37 25C36 16 32 4 32 4Z"
                  fill="url(#chamaExterna)"
                  opacity="0.85"
                />
                <path
                  d="M32 18C32 18 21 30 21 41C21 47.5 26 53 32 53C38 53 43 47.5 43 41C43 34 32 18 32 18Z"
                  fill="url(#chamaInterna)"
                />
                <defs>
                  <linearGradient id="chamaExterna" x1="32" y1="58" x2="32" y2="4" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EA580C" />
                    <stop offset="0.6" stopColor="#FF6B2B" />
                    <stop offset="1" stopColor="#FFB830" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="chamaInterna" x1="32" y1="53" x2="32" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFB830" />
                    <stop offset="1" stopColor="#FFFBEB" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-fire-500/40 bg-night-950 text-xs font-extrabold text-ember-400 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-ember-300 group-hover:bg-linear-to-t group-hover:from-fire-600 group-hover:via-fire-500 group-hover:to-ember-300 group-hover:text-white group-hover:shadow-[0_0_24px_rgba(255,107,43,0.9)]">
                {passo.numero}
              </div>
            </div>

            {/* Texto da Etapa */}
            <div className="relative z-10 space-y-1 pt-0.5">
              <h3 className="text-lg font-extrabold tracking-tight bg-linear-to-r from-fire-400 via-ember-400 to-ember-300 bg-clip-text text-transparent transition-all duration-300 group-hover:from-ember-300 group-hover:via-white group-hover:to-ember-200 group-hover:drop-shadow-[0_0_12px_rgba(255,107,43,0.85)]">
                {passo.titulo}
              </h3>
              <p className="text-xs leading-relaxed text-night-300 transition-colors duration-300 group-hover:text-white">
                {passo.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé do Card */}
      <div className="relative z-10 flex items-center justify-between border-t border-night-800 pt-4 text-xs text-night-400">
        <span>Catálogo integrado via Steam</span>
        <span className="text-ember-400 font-semibold">Checkpoint</span>
      </div>
    </div>
  );
};
