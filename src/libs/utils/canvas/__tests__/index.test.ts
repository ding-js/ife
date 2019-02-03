import { generateCanvas } from '../';

describe('generateCanvas', () => {
  it('arguments', () => {
    const container = document.createElement('div');

    expect(() => {
      generateCanvas(container);
    }).toThrow('Invalid options');
  });
  it('div', () => {
    const container = document.createElement('div');
    const result = generateCanvas(container, { width: 10, height: 20 });

    expect(result.width).toBe(10);
    expect(result.height).toBe(20);
    expect(result.canvas.getAttribute('width')).toBe('10');
    expect(result.canvas.getAttribute('height')).toBe('20');
    expect(container.querySelector('canvas')).toBe(result.canvas);
  });
  it('canvas', () => {
    const canvas = document.createElement('canvas');
    const result = generateCanvas(canvas, { width: 10, height: 20 });

    expect(result.width).toBe(10);
    expect(result.height).toBe(20);
    expect(result.canvas.getAttribute('width')).toBe('10');
    expect(result.canvas.getAttribute('height')).toBe('20');
    expect(result.canvas).toBe(canvas);
  });
});
