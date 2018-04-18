import Cropper from '../';

beforeAll(() => {
  document.body.innerHTML = '<div id="t1"></div>';
});

describe('Cropper lifecycle', () => {
  it('create & destroy', () => {
    const container = document.querySelector('#t1') as HTMLElement;
    const cropper = new Cropper(container);

    expect(container.querySelector('canvas')).not.toBeNull();

    cropper.destroy();

    expect(container.querySelector('canvas')).toBeNull();
  });
});
