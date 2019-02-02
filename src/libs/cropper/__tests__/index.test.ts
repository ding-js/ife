import { canvasToBuffer } from '@/test-utils';
import Cropper from '../';

beforeAll(() => {
  document.body.innerHTML = '<div id="t1"></div>';
});

describe('Cropper lifecycle', () => {
  it('create & destroy', () => {
    const container = document.querySelector('#t1') as HTMLElement;
    const cropper = new Cropper(container);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
    expect(canvasToBuffer(canvas)).toMatchImageSnapshot();
    cropper.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });
});
