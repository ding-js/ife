export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export const HSV = [
  'rgb(255, 0, 0)',
  'rgb(255, 255, 0)',
  'rgb(0, 255, 0)',
  'rgb(0, 255, 255)',
  'rgb(0, 0, 255)',
  'rgb(255, 0, 255)',
  'rgb(255, 0, 0)'
];

export function RGBtoHSL(color: RGB): HSL {
  let { r, g, b } = color;

  [r, g, b] = [r, g, b].map(num => num / 255);

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const diff = max - min;
    s = l < 0.5 ? diff / (max + min) : diff / (2 - max - min);
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  [h, s, l] = [h, s, l].map(num => Math.round(num * 100) / 100);

  return {
    h,
    s,
    l
  };
}

export function RGBtoHEX(color: RGB) {
  const { r, g, b } = color;

  return [r, g, b]
    .map(num => {
      const str = num.toString(16);
      return str.length < 2 ? '0' + str : str;
    })
    .join('');
}

export function HSVtoRGB({ h, s, v }): RGB {
  let r, g, b;
  let i;
  let f, p, q, t;

  // Make sure our arguments stay in-range
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));

  if (s === 0) {
    // Achromatic (grey)
    r = g = b = v;
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  f = h - i; // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));

  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;

    case 1:
      r = q;
      g = v;
      b = p;
      break;

    case 2:
      r = p;
      g = v;
      b = t;
      break;

    case 3:
      r = p;
      g = q;
      b = v;
      break;

    case 4:
      r = t;
      g = p;
      b = v;
      break;

    case 5:
      // case 5:
      r = v;
      g = p;
      b = q;
    default:
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function RGBtoHSV(color: RGB): HSV {
  let { r, g, b } = color;

  [r, g, b] = [r, g, b].map(n => n / 255);

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  let h, s;
  const v = max;
  const d = max - min;

  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = h / 6 * 360;
  }

  return { h, s, v };
}
