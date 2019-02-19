import * as utils from '../utils';
import { generateCanvas } from '../utils/canvas';
import { bind, unbind } from '../utils/move';

interface Options {
  preview?: PreviewConfig | PreviewConfig[];
  width?: number;
  height?: number;
  onCropperChange?(cropper: Square): void;
}

interface Coordinate {
  x: number;
  y: number;
}

interface Square extends Coordinate {
  width: number;
  height: number;
}

interface SquareConfig {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

interface ImageSquare extends Square {
  element: HTMLImageElement;
  clientWidth: number;
  clientHeight: number;
}

interface TypeConfig {
  cursor: string;
  handler?(e: Coordinate): void;
}
interface PreviewConfig {
  container: HTMLElement;
  zoom: number;
}

interface Preview extends PreviewConfig {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

interface PointType extends Coordinate {
  type: Types;
  offsetX: number;
  offsetY: number;
}

enum Types {
  cropper,
  image,
  pointRD,
  background
}

export default class Cropper {
  public static Messages = {
    1001: '没有图片'
  };

  private _options: Options;
  private _ctx: CanvasRenderingContext2D;
  private _canvas: HTMLCanvasElement;
  private _id: number;
  private _startPoint: PointType;

  private _previewList: Preview[];

  private _image: ImageSquare;
  private _cropper: Square;
  private _point: Square;

  private _scale: number = 1;

  private _types: {
    [key: number]: TypeConfig;
  };

  private _cropperCanvas: HTMLCanvasElement;
  private _cropperCtx: CanvasRenderingContext2D;

  constructor(container: HTMLElement | HTMLCanvasElement, options?: Options) {
    const r = generateCanvas(container, options, {
      width: 700,
      height: 450
    });

    const _options = Object.assign({}, options, {
      width: r.width,
      height: r.height
    });

    this._canvas = r.canvas;
    this._ctx = r.canvas.getContext('2d');
    this._options = _options;
    this._types = {
      [Types.cropper]: {
        cursor: 'all-scroll',
        handler: this.handleCropperMove
      },
      [Types.image]: {
        cursor: 'default',
        handler: this.handleImageMove
      },
      [Types.pointRD]: {
        cursor: 'nwse-resize',
        handler: this.handlePointMove
      },
      [Types.background]: {
        cursor: 'default'
      }
    };

    this.init();
  }

  private init() {
    const op = this._options;
    const canvas = this._canvas;
    const cW = op.width / 3;
    const cH = op.height / 3;

    this._cropperCanvas = document.createElement('canvas');
    this._cropperCtx = this._cropperCanvas.getContext('2d');
    this.cropper = {
      width: cW,
      height: cH,
      x: (op.width - cW) / 2,
      y: (op.height - cH) / 2
    };

    if (op.preview) {
      this._previewList = (Array.isArray(op.preview) ? op.preview : [op.preview]).map(v => {
        const cvs = document.createElement('canvas');

        v.container.appendChild(cvs);
        return { ...v, canvas: cvs, ctx: cvs.getContext('2d') };
      });
    }

    // 缩放
    canvas.addEventListener('mousewheel', this.handleMouseWheel);

    this._id = bind(canvas, {
      onStart: this.handleStart,
      onMove: this.handleMove
    });
  }

  private handleStart = e => {
    this._startPoint = this.getPointByCoordinate(e.x, e.y);
  };

  private handleMove = e => {
    const type = this._types[this._startPoint.type];

    if (!type || !type.handler) {
      return;
    }

    type.handler(e);
  };

  private handleMouseWheel = (e: MouseWheelEvent) => {
    e.preventDefault();

    const image = this._image;
    if (!image) {
      return;
    }

    let width = image.clientWidth,
      height = image.clientHeight,
      k; // 最终的缩放系数
    const scale = this._scale,
      offset = e.deltaY / 800;

    if (offset > 0) {
      k = 1 / (1 + offset);
    } else {
      k = 1 + Math.abs(offset);
    }

    k *= scale;

    this._scale = k;

    width *= k;
    height *= k;
    image.x += (image.width - width) / 2;
    image.y += (image.height - height) / 2;
    image.width = width;
    image.height = height;

    this.draw();
  };

  private getPointByCoordinate(x, y): PointType {
    const point = this._point;
    const cropper = this._cropper;
    const image = this._image;
    const t: PointType = {
      x,
      y
    } as PointType;

    // 设置偏移(点击坐标与定点坐标)
    if (point && x > point.x && x < point.x + point.width && y > point.y && y < point.y + point.height) {
      t.type = Types.pointRD;
    } else if (
      cropper &&
      x > cropper.x &&
      x < cropper.x + cropper.width &&
      y > cropper.y &&
      y < cropper.y + cropper.height
    ) {
      t.offsetX = x - cropper.x;
      t.offsetY = y - cropper.y;
      t.type = Types.cropper;
    } else if (image && x > image.x && x < image.x + image.width && y > image.y && y < image.y + image.height) {
      t.offsetX = x - image.x;
      t.offsetY = y - image.y;
      t.type = Types.image;
    } else {
      t.type = Types.background;
    }

    return t;
  }

  private updatePoint() {
    const c = this._cropper;
    const w = 8;
    const h = 8;

    this._point = {
      width: w,
      height: h,
      x: c.x + c.width - w / 2,
      y: c.y + c.height - h / 2
    };
  }

  private handleImageMove = ({ x, y }) => {
    const s = this._startPoint;

    this._image.x = x - s.offsetX;
    this._image.y = y - s.offsetY;

    this.draw();
  };

  private handleCropperMove = ({ x, y }) => {
    const { width, height } = this._options;
    const s = this._startPoint;
    const oX = s.offsetX;
    const oY = s.offsetY;
    const maxX = width - this._cropper.width;
    const maxY = height - this._cropper.height;

    let currentX = x - oX,
      currentY = y - oY;

    // 判断边界

    if (currentX < 0) {
      currentX = 0;
    }

    if (currentX > maxX) {
      currentX = maxX;
    }

    if (currentY < 0) {
      currentY = 0;
    }

    if (currentY > maxY) {
      currentY = maxY;
    }

    this.cropper = {
      x: currentX,
      y: currentY
    };
  };

  private handlePointMove = ({ x, y }) => {
    const s = this._startPoint;
    const w = x - this._cropper.x;
    const h = y - this._cropper.y;

    if (w <= 0 || h <= 0) {
      return;
    }

    this.cropper = {
      width: w,
      height: h
    };
  };

  // 填充背景
  private fillBackground() {
    const { width, height } = this._options;

    const ctx = this._ctx,
      side = width / 40,
      x = Math.ceil(width / side),
      y = Math.ceil(height / side);

    ctx.save();

    ctx.fillStyle = '#ccc';

    let k = 0;
    for (let i = 0; i < y; i++) {
      for (let j = 0; j < x; j++) {
        if ((k + i) % 2 === 0) {
          ctx.fillRect(j * side, i * side, side, side);
        }
        k++;
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.1)';

    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  private fillImage() {
    const ctx = this._ctx,
      image = this._image;

    if (image) {
      ctx.drawImage(image.element, image.x, image.y, image.width, image.height);
    }
  }

  private fillCropper() {
    const ctx = this._ctx,
      cropper = this._cropper;
    const point = this._point;

    ctx.save();
    ctx.strokeStyle = '#39f';
    ctx.strokeRect(cropper.x, cropper.y, cropper.width, cropper.height);
    ctx.fillStyle = '#39f';
    ctx.fillRect(point.x, point.y, point.width, point.height);
    ctx.restore();
  }

  private draw() {
    const { width, height } = this._options;

    // 避免预览到背景
    this._ctx.clearRect(0, 0, width, height);

    this.fillBackground();
    this.fillImage();
    this.fillCropper();
    this.preview();
  }

  private updateImage(image: HTMLImageElement) {
    if (!image.src) {
      return;
    }

    const { width, height } = this._options;
    const clientW = image.width,
      clientH = image.height;
    let currentW = clientW,
      currentH = clientH,
      k = 1; // contain 时的缩放比

    // contain 图片
    if (clientW > width) {
      currentW = width;
      k = currentW / clientW;
      currentH = k * clientH;
    }

    if (currentH > height) {
      currentH = height;
      k = currentH / clientH;
      currentW = k * clientW;
    }

    // 清空配置
    this._image = {
      element: image,
      width: currentW,
      height: currentH,
      x: (width - currentW) / 2,
      y: (height - currentH) / 2,
      clientWidth: clientW,
      clientHeight: clientH
    };

    this._scale = k;
    this.draw();
  }

  private preview() {
    if (!this._previewList || !this._image) {
      return;
    }

    const scale = this._scale;
    const image = this._image;
    const cropper = this._cropper;
    const op = this._options;

    this._previewList.forEach(v => {
      const w = cropper.width * v.zoom;
      const h = cropper.height * v.zoom;

      v.canvas.width = w;
      v.canvas.height = h;

      v.ctx.clearRect(0, 0, w, h);
      v.ctx.drawImage(
        image.element,
        (image.x - cropper.x) * v.zoom,
        (image.y - cropper.y) * v.zoom,
        image.width * v.zoom,
        image.height * v.zoom
      );
    });
  }

  public crop() {
    return new Promise((resolve, reject) => {
      const { width, height } = this._options;
      const image = this._image;
      const cropper = this._cropper;
      const ctx = this._cropperCtx;

      if (!image.element) {
        reject({
          code: 1001,
          message: Cropper.Messages['1001']
        });
      }

      Object.assign(this._cropperCanvas, {
        width: cropper.width,
        height: cropper.height
      });

      ctx.clearRect(0, 0, width, height);

      ctx.drawImage(image.element, image.x - cropper.x, image.y - cropper.y, image.width, image.height);

      const url = this._cropperCanvas.toDataURL();

      resolve(url);
    });
  }

  public destroy() {
    const remove = (el: HTMLElement) => el.parentNode.removeChild(el);
    unbind(this._id);
    window.removeEventListener('mousewheel', this.handleMouseWheel);

    remove(this._canvas);
    if (this._previewList) {
      this._previewList.forEach(v => {
        remove(v.canvas);
      });
    }
  }

  set image(image: File | HTMLImageElement) {
    if (image instanceof HTMLImageElement) {
      this.updateImage(image);
    } else if (image instanceof File) {
      if (!image.type.match(/^image\/.+$/)) {
        utils.toast('请选择正确的图片文件');
        return;
      }
      const reader = new FileReader();

      reader.onload = e => {
        const _image = new Image();
        _image.src = (e.target as any).result;
        _image.onload = () => {
          this.updateImage(_image);
        };
      };

      reader.readAsDataURL(image);
    } else {
      return;
    }
  }

  get image() {
    return this._image.element;
  }

  set cropper(cropper: SquareConfig) {
    if (!this._cropper) {
      this._cropper = {} as Square;
    }

    let change = false;

    Object.keys(cropper).forEach(k => {
      const v = Math.round(cropper[k]);

      if (this._cropper[k] !== v) {
        this._cropper[k] = v;
        change = true;
      }
    });

    if (!change) {
      return;
    }

    this.updatePoint();

    if (this._options.onCropperChange) {
      this._options.onCropperChange(this._cropper);
    }

    this.draw();
  }

  get cropper() {
    return this._cropper;
  }
}
