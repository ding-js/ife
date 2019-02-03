interface CanvasOptions {
  width?: number;
  height?: number;
}

interface CanvasResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export const generateCanvas = (
  container: HTMLElement | HTMLCanvasElement,
  options: CanvasOptions = {},
  defaultOptions: CanvasOptions = {}
): CanvasResult => {
  if (!container || !container.tagName) {
    throw new Error('Invalid element');
  }

  const [w, h] = ['width', 'height'].map(key => {
    if (typeof options[key] === 'number') {
      return options[key];
    }

    return (
      +container.getAttribute(key) ||
      defaultOptions[key] ||
      +container['offset' + key.charAt(0).toUpperCase() + key.slice(1)] ||
      0
    );
  });

  if (!w || !h) {
    throw new Error('Invalid options');
  }

  let canvas: HTMLCanvasElement;

  if (container.tagName === 'CANVAS') {
    canvas = container as HTMLCanvasElement;
  } else {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }

  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);

  return { canvas, width: w, height: h };
};
