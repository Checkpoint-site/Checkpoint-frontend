export type FiltroPesquisa = 'nome' | 'data' | 'autor';

export interface ParametrosPesquisa {
  filtro: FiltroPesquisa;
  termo: string;
  data: string;
}
