import { useSyncExternalStore } from 'react';
import { EVENTO_MUDANCA_AUTENTICACAO, possuiToken } from './armazenamentoToken';

function inscreverAutenticacao(aoMudar: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(EVENTO_MUDANCA_AUTENTICACAO, aoMudar);
  window.addEventListener('storage', aoMudar);
  return () => {
    window.removeEventListener(EVENTO_MUDANCA_AUTENTICACAO, aoMudar);
    window.removeEventListener('storage', aoMudar);
  };
}

export function useAutenticado(): boolean {
  return useSyncExternalStore(inscreverAutenticacao, possuiToken, () => false);
}
