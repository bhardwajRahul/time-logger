export function capitalizeFirstLetter(val: unknown): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function truncate(val: string, length: number = 20, ellipsis: string = '…'): string {
  return val.length > length ? `${val.slice(0, length)}${ellipsis}` : val;
}
