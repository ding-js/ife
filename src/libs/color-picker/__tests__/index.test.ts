import { canvasToBuffer } from '@/test-utils';
import ColorPicker from '../';

describe('Color Picker lifecycle', () => {
  it('create & destroy', () => {
    const container = document.createElement('div');
    const picker = new ColorPicker(container);

    expect(container.querySelectorAll('canvas').length).toBe(2);
    picker.destroy();
    expect(container.querySelectorAll('canvas').length).toBe(0);
  });
});

describe('Color Picker public methods', () => {
  it('color setter', async () => {
    const container = document.createElement('div');
    const picker = new ColorPicker(container);
    const canvas = container.querySelectorAll('canvas');
    const block = canvas[0];
    const bar = canvas[1];
    picker.color = {
      rgb: [50, 255, 40]
    };

    expect(canvasToBuffer(block)).toMatchImageSnapshot();
    expect(canvasToBuffer(bar)).toMatchImageSnapshot();
  });
});
