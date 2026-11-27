import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { obterToken, removerToken, salvarToken } from '@shared/lib';
import { Header } from '@widgets/index';

const TOKEN_TESTE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImJyMTU1OTU0NkBnbWFpbC5jb20ifQ.assinatura';

describe('Header com Pesquisa Expansível, Sino e Menu Hambúrguer', () => {
  beforeEach(() => {
    removerToken();
  });

  it('exibe apenas Logo, Início, Entrar e Criar Conta quando não autenticado (sem itens da área principal)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Checkpoint/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Início$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Criar Conta$/i })).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: /Explorar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Top 10/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Comunidade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Minha Estante/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir pesquisa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Notificações/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir menu/i })).not.toBeInTheDocument();
  });

  it('mantém o cabeçalho limpo nas telas de Login e Cadastro mesmo se houver token salvo', () => {
    salvarToken(TOKEN_TESTE);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Criar Conta$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Explorar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Minha Estante/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir pesquisa/i })).not.toBeInTheDocument();
  });

  it('exibe lupinha, sino de notificações e menu hambúrguer (3 traços) quando autenticado', () => {
    salvarToken(TOKEN_TESTE);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Abrir pesquisa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notificações/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir menu/i })).toBeInTheDocument();
  });

  it('abre o menu hambúrguer com avatar circular anônimo, Configurações em cima, Perfil e Sair no fim', () => {
    salvarToken(TOKEN_TESTE);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Abrir menu/i }));

    const dialogoMenu = screen.getByRole('dialog', { name: /Menu da conta/i });
    expect(dialogoMenu).toBeInTheDocument();

    const avatar = within(dialogoMenu).getByAltText(/Avatar do usuário/i);
    expect(avatar).toBeInTheDocument();
    expect(within(dialogoMenu).getByText('br1559546@gmail.com')).toBeInTheDocument();

    const botoesNavegacao = within(
      within(dialogoMenu).getByRole('navigation', { name: /Opções da conta/i })
    ).getAllByRole('button');
    expect(botoesNavegacao[0]).toHaveTextContent(/Configurações/i);
    expect(botoesNavegacao[1]).toHaveTextContent(/Perfil/i);

    const botaoSair = within(dialogoMenu).getByRole('button', { name: /^Sair$/i });
    fireEvent.click(botaoSair);

    expect(obterToken()).toBeNull();
  });

  it('expande a lupinha com as 3 opções (Nome, Data com calendário e Autor)', () => {
    salvarToken(TOKEN_TESTE);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Abrir pesquisa/i }));

    const abaNome = screen.getByRole('tab', { name: /Nome/i });
    const abaData = screen.getByRole('tab', { name: /Data/i });
    const abaAutor = screen.getByRole('tab', { name: /Autor/i });

    expect(abaNome).toHaveAttribute('aria-selected', 'true');
    expect(abaData).toBeInTheDocument();
    expect(abaAutor).toBeInTheDocument();

    fireEvent.click(abaData);
    expect(abaData).toHaveAttribute('aria-selected', 'true');

    const calendario = screen.getByRole('dialog', {
      name: /Calendário de pesquisa por data/i,
    });
    expect(calendario).toBeInTheDocument();

    // Seleciona outro ano e mês diretamente pelos botões do cabeçalho
    fireEvent.click(within(calendario).getByRole('button', { name: /Selecionar ano/i }));
    fireEvent.click(within(calendario).getByRole('button', { name: '2024' }));
    fireEvent.click(within(calendario).getByRole('button', { name: 'Mai' }));

    fireEvent.click(within(calendario).getByRole('button', { name: '15' }));
    expect(
      screen.queryByRole('dialog', { name: /Calendário de pesquisa por data/i })
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/15\/05\/2024/).length).toBeGreaterThan(0);

    fireEvent.click(abaAutor);
    expect(
      screen.getByLabelText(/Buscar por autor ou estúdio/i)
    ).toBeInTheDocument();
  });

  it('abre o painel de notificações ao clicar no sino', () => {
    salvarToken(TOKEN_TESTE);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Notificações/i }));

    expect(
      screen.getByRole('dialog', { name: /Painel de notificações/i })
    ).toBeInTheDocument();
  });
});
