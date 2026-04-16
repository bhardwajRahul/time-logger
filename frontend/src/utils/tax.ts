import type { TaxType } from '@/interfaces/entity/tax';

export function formatTaxRate(rate: number | string, type: TaxType): string {
  const numRate = Number(rate);
  if (type === 'percentage') {
    return `${(numRate * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
  }
  return numRate.toFixed(2);
}
