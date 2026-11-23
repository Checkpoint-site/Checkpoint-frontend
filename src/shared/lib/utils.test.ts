import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('mescla nomes de classes corretamente', () => {
    expect(cn('px-2 py-1', 'bg-neutral-800')).toBe('px-2 py-1 bg-neutral-800');
  });

  it('trata classes condicionais', () => {
    const isHidden = false;
    const isVisible = true;
    expect(cn('base', isHidden && 'hidden', isVisible && 'block')).toBe('base block');
  });

  it('resolve conflitos de classes do Tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
