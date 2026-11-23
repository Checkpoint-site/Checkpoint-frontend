# 🔥 Checkpoint — Front-end

<div align="center">

![React](https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Feature--Sliced_Design_(FSD)-FF6B35?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-F59E0B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**Sua jornada nos games, registrada.**

Uma rede social para quem ama jogar: descubra, registre, avalie e compartilhe os games que marcaram você.

</div>

---

## 🎮 O que é o Checkpoint?

Nos games, um *checkpoint* é aquele ponto da fogueira onde você salva o progresso, descansa e segue em frente. Esse é o espírito da nossa plataforma.

Inspirado no impacto que o *Letterboxd* tem para o cinema, o **Checkpoint** é o espaço definitivo para gamers registrarem sua trajetória: notas, reviews detalhados, controle de backlog e wishlist, diário de jogatina e conexão direta com a comunidade de jogadores. Toda a base de dados de jogos é alimentada e sincronizada via **Steam Web API** através do nosso back-end.

Este repositório concentra a **aplicação web moderna**, construída com **React 19**, **Vite** e **Tailwind CSS v4**, orientada pela metodologia de engenharia de software **Feature-Sliced Design (FSD v2.1)** para garantir manutenibilidade, desacoplamento e escalabilidade a longo prazo.

---

## 🎯 Funcionalidades da Interface

- 📚 **Exploração de Catálogo:** Busca e filtros dinâmicos de títulos sincronizados com a Steam.
- 📓 **Diário de Jogos:** Acompanhamento em tempo real do status de progresso (*Jogando*, *Zerado*, *Pausado*, *Abandonado*).
- ⭐ **Sistema de Reviews & Notas:** Criação de resenhas com avaliação por estrelas, comentários e reações.
- 📌 **Backlog & Wishlist:** Interface interativa para organizar fila de jogos e prioridades de jogatina.
- 📋 **Listas Personalizadas:** Montagem de coleções temáticas com layout customizável e compartilhamento público.
- 👥 **Perfis & Feeds Sociais:** Feed de atividades de amigos, estatísticas de jogos zerados e histórico pessoal.

---

## 🏛️ Arquitetura de Software: Feature-Sliced Design (FSD)

O front-end adota estritamente o **Feature-Sliced Design (FSD v2.1)**, garantindo que o código seja previsível, modular e que novas funcionalidades possam ser adicionadas sem criar acoplamento desordenado.

### 1. Hierarquia das Camadas (Top to Bottom)

O fluxo de dependências é estritamente unidirecional: uma camada superior só pode consumir módulos de camadas inferiores a ela.

```text
┌──────────────────────────────────────────┐
│                  app                     │  -> Provedores globais, rotas e estilos
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│                 pages                    │  -> Telas e páginas completas
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│                widgets                   │  -> Blocos autônomos de UI (Header, Footer, Feeds)
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│               features                   │  -> Ações do usuário com valor de negócio
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│               entities                   │  -> Entidades de negócio (Game, User, Review, List)
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│                shared                    │  -> Utilitários, UI Kit atômico, tipos e cliente API
└──────────────────────────────────────────┘
```

### 2. Princípios e Regras de Ouro

1. **Dependência Linear:** Módulos em uma camada nunca importam outros módulos da mesma camada (ex.: uma *feature* não pode importar diretamente outra *feature*; essa orquestração cabe a um *widget* ou *page*).
2. **Public API Explícita:** Cada fatia (*slice*) expõe exclusivamente o que é necessário através de seu arquivo `index.ts`. O acesso interno aos detalhes de implementação é protegido.
3. **Mapeamento Modular de Domínio:** O design do front-end espelha os contextos de domínio do back-end:
   - `entities/game` & `features/search-games` ➔ Contexto de **Catalog**
   - `entities/user` & `features/manage-profile` ➔ Contexto de **Users**
   - `entities/diary-entry` & `features/log-gameplay` ➔ Contexto de **Diary**
   - `entities/review` & `features/publish-review` ➔ Contexto de **Reviews**
   - `entities/custom-list` & `features/create-list` ➔ Contexto de **Lists**

---

## 📂 Estrutura de Pastas

```text
src/
├── app/                      # Configurações de inicialização da aplicação
│   ├── providers/            # Provedores de contexto, router e query client
│   ├── styles/               # CSS global e declaração do Tailwind CSS
│   ├── App.tsx               # Componente base da aplicação
│   └── index.ts              # Ponto de exportação da camada app
│
├── pages/                    # Camada de páginas (rotas da aplicação)
│   ├── home/                 # Página inicial (Landing / Feed)
│   └── index.ts
│
├── widgets/                  # Componentes estruturais e blocos de layout
│   ├── header/               # Barra de navegação e busca rápida
│   ├── footer/               # Rodapé informativo do ecossistema
│   └── index.ts
│
├── features/                 # Interações orientadas à ação do usuário
│   └── index.ts              # (ex.: write-review, toggle-backlog, filter-catalog)
│
├── entities/                 # Modelos conceituais e representações de domínio
│   └── index.ts              # (ex.: game, user, review, diary)
│
├── shared/                   # Componentes agnósticos e reutilizáveis
│   ├── api/                  # Base fetcher e instância do cliente HTTP
│   ├── config/               # Definição de rotas, constantes e variáveis de ambiente
│   ├── lib/                  # Utilitários (helper cn para Tailwind, formatação)
│   ├── types/                # Definições de tipos TypeScript compartilhados
│   ├── ui/                   # Design System atômico (Button, Input, Card, Modal)
│   └── index.ts
│
├── main.tsx                  # Ponto de montagem da raiz React (DOM)
└── vite-env.d.ts             # Tipagens de ambiente do Vite
```

---

## 🧰 Path Aliases

Para manter imports limpos e livres de caminhos relativos complexos (`../../..`), os seguintes aliases estão configurados no `vite.config.ts` e `tsconfig.app.json`:

| Alias | Caminho Físico | Camada FSD |
| :--- | :--- | :--- |
| `@app/*` | `src/app/*` | App layer |
| `@pages/*` | `src/pages/*` | Pages layer |
| `@widgets/*` | `src/widgets/*` | Widgets layer |
| `@features/*` | `src/features/*` | Features layer |
| `@entities/*` | `src/entities/*` | Entities layer |
| `@shared/*` | `src/shared/*` | Shared layer |
| `@/*` | `src/*` | Raiz do código-fonte |

---

## 🛠️ Stack Tecnológica

| Ferramenta | Finalidade |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Biblioteca para interfaces de usuário declarativas e componentes funcionais |
| **[Vite 8](https://vitejs.dev/)** | Build tool e dev server ultrarrápido com Hot Module Replacement (HMR) |
| **[TypeScript 5.8](https://www.typescriptlang.org/)** | Tipagem estática avançada garantindo segurança e integridade do código |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Framework de estilização utility-first de alta performance com engine `@tailwindcss/vite` |
| **[React Router DOM v7](https://reactrouter.com/)** | Roteamento declarativo no lado do cliente |
| **[tailwind-merge & clsx](https://github.com/dcastilho/tailwind-merge)** | Concatenação e mesclagem condicional inteligente de classes CSS |

---

## 🗂️ Ecossistema Checkpoint

O ecossistema é mantido e organizado na organização **[Checkpoint-site](https://github.com/Checkpoint-site)**:

| Repositório | Descrição | Stack |
| :--- | :--- | :--- |
| 🖥️ **[`Checkpoint-frontend`](https://github.com/Checkpoint-site/Checkpoint-frontend)** | Aplicação Web SPA *(este repositório)* | React 19, Vite, Tailwind v4, FSD |
| 🔙 **[`Checkpoint-backend`](https://github.com/Checkpoint-site/Checkpoint-backend)** | Web API e regras de negócio | C#, .NET 10, Modular Monolith, DDD |
| 🏢 **[`.github`](https://github.com/Checkpoint-site/.github)** | Perfil institucional e documentação geral da organização | Markdown |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** `>= 20.x` (recomendado: Node 22+)
- Gerenciador de pacotes **npm**, **yarn** ou **pnpm**

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone git@github.com:Checkpoint-site/Checkpoint-frontend.git
cd Checkpoint-frontend

# 2. Instalar as dependências
npm install

# 3. Configurar variáveis de ambiente (se necessário)
cp .env.example .env.local

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará acessível em: `http://localhost:3000` ou na porta informada pelo Vite.

### Scripts Disponíveis

```bash
npm run dev       # Inicia o servidor local de desenvolvimento (HMR)
npm run build     # Executa checagem de tipos (tsc) e gera a build de produção em dist/
npm run preview   # Roda um servidor local servindo a build gerada em dist/
```

---

## 🤝 Como Contribuir

Quer ajudar a acender essa fogueira? Contribuições são muito bem-vindas!

1. Verifique as *issues* abertas no repositório ou crie uma nova para discutir ideias.
2. Crie uma branch a partir da `develop`:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Mantenha os padrões arquiteturais de **Feature-Sliced Design**.
4. Realize seus commits seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(catalog): adicionar componente de busca de jogos"
   ```
5. Envie um Pull Request direcionado à branch `develop`.

---

## 👨‍💻 Time de Desenvolvimento

- [@Diniz-Bruno](https://github.com/Diniz-Bruno)
- [@Pereira-Sousa](https://github.com/Pereira-Sousa)

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<div align="center">

🔥 *Descanse na fogueira. Salve seu progresso. Continue a jornada.*

</div>
