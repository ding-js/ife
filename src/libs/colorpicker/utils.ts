export function Rgb2Hsl(rgb: number[]): number[] {
  const [r, g, b] = rgb.map(num => num / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const diff = max - min;
    s = l < 0.5 ?
      diff / (max + min) :
      diff / (2 - max - min);
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
        return [];
    }

    h /= 6;
  }

  return [h, s, l].map(num => Math.round(num * 100) / 100);
}

export function Rgb2Hex(rgb: number[]) {
  return rgb.map(num => {
    const str = num.toString(16);
    return str.length < 2 ? '0' + str : str;
  }).join('');
}

export function ImageData2Rgb(pixel: ImageData): number[] {
  return Array.prototype.slice.call(pixel.data, 0, 3);
}

export function Hsl2Rgb(hsl: number[]) {
  const [h, s, l] = hsl;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) {
        t += 1;
      } else if (t > 1) {
        t -= 1;
      }

      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }

      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }

      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b].map(num => Math.round(num * 255));
}
