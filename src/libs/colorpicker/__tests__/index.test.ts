import ColorPicker from '../';
import { Buffer } from 'buffer';

beforeAll(() => {
  document.body.innerHTML = '<div id="t1" /><div id="t2" />';
});

describe('Color Picker lifecycle', () => {
  it('create & destory', () => {
    const container = document.querySelector('#t1') as HTMLElement;

    const picker = new ColorPicker(container);

    const canvas = container.querySelectorAll('canvas');

    expect(canvas.length).toBe(2);

    const block = canvas[0];
    const bar = canvas[1];

    expect(block.parentNode).toBe(container);
    expect(block.parentNode).toBe(container);

    picker.destroy();
    expect(bar.parentNode).not.toBe(container);
    expect(bar.parentNode).not.toBe(container);
  });
});

describe('Color Picker public methods', () => {
  const dataUrlReg = /^.+?,/;

  it('color setter', () => {
    const container = document.querySelector('#t2') as HTMLElement;

    const picker = new ColorPicker(container);

    const canvas = container.querySelectorAll('canvas');

    const block = canvas[0];
    const bar = canvas[1];

    picker.color = {
      r: 255,
      g: 0,
      b: 0
    };

    // node-canvase toDataURL 结果不正确
    // expect(
    //   Buffer.from(block.toDataURL().replace(dataUrlReg, ''), 'base64')
    // ).toMatchImageSnapshot();
  });
});
