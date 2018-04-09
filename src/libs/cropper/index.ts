import * as utils from '../utils';
import { generateCanvas } from '../utils/canvas';
import { bind, unbind } from '../utils/move';

interface Options {
  preview?: PreviewConfig | PreviewConfig[];
  width?: number;
  height?: number;
}

interface Coordinate {
  x: number;
  y: number;
}

interface Square extends Coordinate {
  width: number;
  height: number;
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

export class Cropper {
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

  private _lineWidth: number = 1;

  constructor(container: HTMLElement | HTMLCanvasElement, options?: Options) {
    const r = generateCanvas(container, options, {
      width: 700,
      height: 450
    });

    const _options = Object.assign({}, options, {
      width: r.width,
      heigth: r.height
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

    if (op.preview) {
      this._previewList = (Array.isArray(op.preview)
        ? op.preview
        : [op.preview]
      ).map(v => {
        const cvs = document.createElement('canvas');

        v.container.appendChild(cvs);
        return { ...v, canvas: cvs, ctx: cvs.getContext('2d') };
      });
    }

    // 缩放
    canvas.addEventListener('mousewheel', this.handleMouseWheel);

    // 判断点击区域
    canvas.addEventListener('mousedown', this.handleMouseDown);

    this._id = bind(canvas, this.handleMove);
  }

  private handleMove = (e: Coordinate) => {
    const type = this._types[this._startPoint.type];

    if (!type || !type.handler) {
      return;
    }

    type.handler(e);
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.which === 1) {
      const x = e.offsetX,
        y = e.offsetY;

      this._startPoint = this.getPointByCoordinate(x, y);
    }
  };

  private handleMouseWheel = (e: MouseWheelEvent) => {
    e.preventDefault();

    const image = this._image;

    if (image.element) {
      // 图片原始宽高,不会改变
      let width = image.element.width,
        height = image.element.height,
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
    }
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
    if (
      x > point.x &&
      x < point.x + point.width &&
      y > point.y &&
      y < point.y + point.height
    ) {
      t.type = Types.pointRD;
    } else if (
      x > cropper.x &&
      x < cropper.x + cropper.width &&
      y > cropper.y &&
      y < cropper.y + cropper.height
    ) {
      t.offsetX = x - cropper.x;
      t.offsetY = y - cropper.y;
      t.type = Types.cropper;
    } else if (
      x > image.x &&
      x < image.x + image.width &&
      y > image.y &&
      y < image.y + image.height
    ) {
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

    this._cropper.x = currentX;
    this._cropper.y = currentY;

    this.updatePoint();

    this.draw();
  };

  private handlePointMove = ({ x, y }) => {
    const s = this._startPoint;
    const w = x - this._cropper.x;
    const h = y - this._cropper.y;

    if (w <= 0 || h <= 0) {
      return;
    }

    this.cropper.width = w;

    this.cropper.height = h;

    this.updatePoint();

    this.draw();
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
    const image = this._image;
    if (image.element) {
      const ctx = this._ctx,
        cropper = this._cropper;

      ctx.save();

      ctx.strokeStyle = '#39f';
      ctx.lineWidth = this._lineWidth;

      ctx.strokeRect(cropper.x, cropper.y, cropper.width, cropper.height);

      ctx.fillStyle = '#39f';
      const point = this._point;

      ctx.fillRect(point.x, point.y, point.width, point.height);

      ctx.restore();
    }
  }

  private getCropperData() {
    const image = this._image,
      cropper = this._cropper;

    let [currentX, currentY, currentH, currentW] = [
      cropper.x,
      cropper.y,
      cropper.height,
      cropper.width
    ];

    let offsetX = 0,
      offsetY = 0;

    // 左边超出边界
    if (cropper.x < image.x) {
      currentX = image.x;
      offsetX = image.x - cropper.x;
      currentW -= offsetX;
    }

    // 上边超出边界
    if (cropper.y < image.y) {
      currentY = image.y;
      offsetY = image.y - cropper.y;
      currentH -= offsetY;
    }

    // 右边超出边界
    if (cropper.x + cropper.width > image.x + image.width) {
      currentW -= cropper.x + cropper.width - (image.x + image.width);
    }

    // 下边超出边界
    if (cropper.y + cropper.height > image.y + image.height) {
      currentH -= cropper.y + cropper.height - (image.y + image.height);
    }

    if (currentW < 0 || currentH < 0) {
      return;
    }

    return {
      width: currentW,
      height: currentH,
      x: currentX,
      y: currentY,
      offsetX,
      offsetY,
      imageData: this._ctx.getImageData(currentX, currentY, currentW, currentH)
    };
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

    if (!this._cropper) {
      const cW = width / 3;
      const cH = height / 3;
      this._cropper = {
        width: cW,
        height: cH,
        x: (width - cW) / 2,
        y: (height - cH) / 2
      };

      this.updatePoint();
    }

    this.draw();
  }

  private preview() {
    if (!this._previewList) {
      return;
    }

    const scale = this._scale;
    const image = this._image;
    const cropper = this._cropper;
    const op = this._options;

    this._previewList.forEach(v => {
      const w = cropper.width * v.zoom;
      const h = cropper.height * v.zoom;

      const transformOrigin = 'top left';

      v.canvas.width = w;
      v.canvas.height = h;

      v.ctx.clearRect(0, 0, w, h);

      v.ctx.drawImage(
        image.element,
        image.x - cropper.x,
        image.y - cropper.y,
        image.width * v.zoom,
        image.height * v.zoom
      );
    });
  }

  public crop(): HTMLCanvasElement {
    if (!this._image.element) {
      utils.toast('请添加一张图片');
      return;
    }

    const { width, height } = this._options;

    this._ctx.clearRect(0, 0, width, height);

    this.fillImage();

    const data = this.getCropperData();
    if (data) {
      const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

      Object.assign(canvas, {
        width: this._cropper.width,
        height: this._cropper.height
      });

      ctx.putImageData(data.imageData, data.offsetX, data.offsetY);

      this.draw();
      return canvas;
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

  set cropper(cropper: Square) {
    if (!this._cropper) {
      this._cropper = cropper;
    } else {
      Object.assign(this._cropper, cropper);
    }

    this.draw();
  }

  get cropper() {
    return this._cropper;
  }
}
