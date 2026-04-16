const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function expandHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return '#' + clean.split('').map((c) => c + c).join('');
  }
  return '#' + clean;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = expandHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

export function hexToRgba(hex: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const normalized = expandHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const aHex = normalized.slice(7, 9);
  const a = aHex.length === 2 ? parseInt(aHex, 16) / 255 : 1;
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
    a: isNaN(a) ? 1 : parseFloat(a.toFixed(2)),
  };
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const aInt = clamp(Math.round(a * 255), 0, 255);
  return (
    rgbToHex(r, g, b) + aInt.toString(16).padStart(2, '0').toUpperCase()
  );
}

export function rgbaToHsla(
  r: number,
  g: number,
  b: number,
  a: number,
): { h: number; s: number; l: number; a: number } {
  return { ...rgbToHsl(r, g, b), a: parseFloat(clamp(a, 0, 1).toFixed(2)) };
}

export function hslaToRgba(
  h: number,
  s: number,
  l: number,
  a: number,
): { r: number; g: number; b: number; a: number } {
  return { ...hslToRgb(h, s, l), a: parseFloat(clamp(a, 0, 1).toFixed(2)) };
}
