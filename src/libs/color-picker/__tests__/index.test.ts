import { canvasToBuffer } from '@/test-utils';
import ColorPicker from '../';

beforeAll(() => {
  document.body.innerHTML = '<div id="t1" /><div id="t2" />';
});

describe('Color Picker lifecycle', () => {
  it('create & destory', () => {
    const container = document.querySelector('#t1') as HTMLElement;
    const picker = new ColorPicker(container);

    expect(container.querySelectorAll('canvas').length).toBe(2);
    picker.destroy();
    expect(container.querySelectorAll('canvas').length).toBe(0);
  });
});

describe('Color Picker public methods', () => {
  it('color setter', async () => {
    const container = document.querySelector('#t2') as HTMLElement;
    const picker = new ColorPicker(container);
    const canvas = container.querySelectorAll('canvas');
    const block = canvas[0];
    const bar = canvas[1];
    picker.color = {
      r: 50,
      g: 255,
      b: 40
    };

    expect(canvasToBuffer(block)).toMatchImageSnapshot();
    expect(canvasToBuffer(bar)).toMatchImageSnapshot();
  });
});
