import { canvasToBuffer } from '@/test-utils';
import Cropper from '../';

describe('Cropper lifecycle', () => {
  it('create & destroy', () => {
    const container = document.createElement('div');
    const cropper = new Cropper(container);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
    expect(canvasToBuffer(canvas)).toMatchImageSnapshot();
    cropper.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });
});
