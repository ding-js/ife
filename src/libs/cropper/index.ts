import * as utils from '../utils';
import { generateCanvas } from '../utils/canvas';
import { bind, unbind } from '../utils/move';

interface Options {
  preview?: Array<{
    container: HTMLElement;
    scale?: number;
  }>;
  width?: number;
  height?: number;
}

interface Type {
  cursor: string;
  handler?(t: TypeDetail): void;
}

interface TypeDetail {
  type?: Types;
  x?: number;
  y?: number;
}

interface Preview {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
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
  private _startT: TypeDetail;
  private _t: TypeDetail;

  private _image: {
    element?: HTMLImageElement;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  } = {};

  private _cropper: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  } = {};

  private _scale: number = 1;
  private _xOffset: number;
  private _yOffset: number;
  private _currentType: Types;
  private _types: {
    [key: number]: Type;
  };

  private _hasPreview: boolean = false; // 是否需要预览功能
  private _previewList: Preview[] = [];
  private _previewScaleCanvas: HTMLCanvasElement;
  private _previewScaleCtx: CanvasRenderingContext2D;

  private _lineWidth: number = 1;
  private _pointWidth: number = 8;
  private _pointHeight: number = 8;

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
    // 初始化预览
    if (op.preview && Array.isArray(op.preview) && op.preview.length > 0) {
      op.preview.forEach(p => {
        const pCanvas = document.createElement('canvas'),
          pCtx = pCanvas.getContext('2d'),
          scale = +p.scale;

        p.container.appendChild(pCanvas);

        const preview: Preview = {
          canvas: pCanvas,
          ctx: pCtx,
          scale: scale > 0 ? scale : 1
        };

        this._previewList.push(preview);
      });

      this._previewScaleCanvas = document.createElement('canvas');
      this._previewScaleCtx = this._previewScaleCanvas.getContext('2d');

      this._hasPreview = true;
    }

    // 缩放
    canvas.addEventListener('mousewheel', this.zoom);

    // 判断点击区域
    canvas.addEventListener('mousedown', this.updateStartPoint);

    this._id = bind(canvas, e => {
      const t = this.getTypeDetail(e.x, e.y);
      const type = this._types[this._startT.type];

      if (type.handler) {
        type.handler(t);
        this.draw();
      }
    });

    // 根据点击时的区域来移动对应的画布元素
    // canvas.addEventListener('mousemove', e => {
    //   const info = this.getTypeInfo(e),
    //     moveType = this._types[info.type],
    //     currentType = this._types[this._currentType];

    //   if (this._moving && currentType.handler) {
    //     currentType.handler(e);
    //     this.draw();
    //   } else if (moveType.cursor) {
    //     const oldCursor = canvas.style.cursor;
    //     if (oldCursor !== moveType.cursor) {
    //       canvas.style.cursor = moveType.cursor;
    //     }
    //   }
    // });
  }

  private updateStartPoint = (e: MouseEvent) => {
    if (e.which === 1) {
      const t = this.getTypeDetail(e.offsetX, e.offsetY);

      this._startT = t;
    }
  };

  private zoom = (e: MouseWheelEvent) => {
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

  private getTypeDetail(x, y): TypeDetail {
    const point = this.getPoint();
    const cropper = this._cropper;
    const image = this._image;
    const info: TypeDetail = {};

    // 设置偏移(点击坐标与定点坐标)
    if (
      x > point.x &&
      x < point.x + point.width &&
      y > point.y &&
      y < point.y + point.height
    ) {
      info.x = x - point.x;
      info.y = y - point.y;
      info.type = Types.pointRD;
    } else if (
      x > cropper.x &&
      x < cropper.x + cropper.width &&
      y > cropper.y &&
      y < cropper.y + cropper.height
    ) {
      info.x = x - cropper.x;
      info.y = y - cropper.y;
      info.type = Types.cropper;
    } else if (
      x > image.x &&
      x < image.x + image.width &&
      y > image.y &&
      y < image.y + image.height
    ) {
      info.x = x - image.x;
      info.y = y - image.y;
      info.type = Types.image;
    } else {
      info.type = Types.background;
    }

    return info;
  }
  private handlePointMove = ({ x, y }) => {
    const w = x - this._cropper.x - this._xOffset + this._pointWidth / 2,
      h = y - this._cropper.y - this._yOffset + this._pointHeight / 2;

    if (w <= 0 || h <= 0) {
      return;
    }

    this.setCropper(w, h, false);
  };

  private getPoint() {
    const cropper = this._cropper,
      w = this._pointWidth,
      h = this._pointHeight,
      x = cropper.x + cropper.width - w / 2,
      y = cropper.y + cropper.height - h / 2;

    return {
      width: w,
      height: h,
      x,
      y
    };
  }

  private handleImageMove = ({ x, y }) => {
    this._image.x = x - this._startT.x;
    this._image.y = y - this._startT.y;
  };

  private handleCropperMove = ({ x, y }) => {
    const { width, height } = this._options;
    const [oX, oY, cW, cH, w, h] = [
      this._xOffset,
      this._yOffset,
      this._cropper.width,
      this._cropper.height,
      width,
      height
    ];

    let currentX = x - oX,
      currentY = y - oY;

    // 判断边界

    if (x < oX) {
      currentX = 0;
    }

    if (x > w - cW + oX) {
      currentX = w - cW;
    }

    if (y < oY) {
      currentY = 0;
    }

    if (y > h - cH + oY) {
      currentY = h - cH;
    }

    this._cropper.x = currentX;
    this._cropper.y = currentY;
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
      const point = this.getPoint();

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

  private preview = () => {
    if (this._image.element && this._hasPreview) {
      const data = this.getCropperData();

      if (data) {
        this._previewScaleCtx.clearRect(
          0,
          0,
          this._cropper.width,
          this._cropper.height
        );

        this._previewScaleCtx.putImageData(
          data.imageData,
          data.offsetX,
          data.offsetY
        );

        this._previewList.forEach(p => {
          const ctx = p.ctx,
            canvas = p.canvas;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (p.scale !== 1) {
            ctx.scale(p.scale, p.scale);

            ctx.drawImage(this._previewScaleCanvas, 0, 0);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
          } else {
            ctx.putImageData(data.imageData, data.offsetX, data.offsetY);
          }
        });
      }
    }
  };

  private draw() {
    const { width, height } = this._options;

    this._ctx.clearRect(0, 0, width, height);

    this.fillImage();

    this.preview();

    // 避免预览到背景

    this._ctx.clearRect(0, 0, width, height);

    this.fillBackground();

    this.fillImage();

    this.fillCropper();
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

  private resetImage(image?: HTMLImageElement) {
    if (!image) {
      if (!this._image.element) {
        return;
      }

      image = this._image.element;
    }

    if (!image.src) {
      return;
    }

    const { width, height } = this._options;

    const iW = image.width,
      iH = image.height,
      w = width,
      h = height,
      cW = w / 3,
      cH = h / 3;

    let currentW = iW,
      currentH = iH,
      k = 1; // cover时的缩放比

    // cover 图片
    if (iW > w) {
      currentW = w;
      k = currentW / iW;
      currentH = k * iH;
    }

    if (currentH > h) {
      currentH = h;
      k = currentH / iH;
      currentW = k * iW;
    }

    // 清空配置
    Object.assign(this._image, {
      element: image,
      width: currentW,
      height: currentH,
      x: (w - currentW) / 2,
      y: (h - currentH) / 2
    });

    this._scale = k;

    this.setCropper(cW, cH);
  }

  public setImage(image: File | HTMLImageElement) {
    if (image instanceof HTMLImageElement) {
      this.resetImage(image);
    } else if (image instanceof File) {
      if (!image.type.match(/^image\/.+$/)) {
        utils.toast('请选择正确的图片文件');
      }
      const reader = new FileReader();

      this._image = {};

      reader.onload = e => {
        const _image = new Image();
        _image.src = (e.target as any).result;
        _image.onload = () => {
          this.resetImage(_image);
        };
      };

      reader.readAsDataURL(image);
    } else {
      return;
    }
  }

  private setPreview(resetCoordinate: boolean = true) {
    const cropper = this._cropper;
    if (this._hasPreview) {
      const { width, height } = this._options;

      if (resetCoordinate) {
        cropper.x = width / 2 - cropper.width / 2;
        cropper.y = height / 2 - cropper.height / 2;
      }

      if (this._previewScaleCanvas) {
        Object.assign(this._previewScaleCanvas, {
          width: cropper.width,
          height: cropper.height
        });
      }

      this._previewList.forEach(p => {
        Object.assign(p.canvas, {
          width: cropper.width * p.scale,
          height: cropper.height * p.scale
        });
      });
    }
  }

  public setCropper(
    width: number,
    height: number,
    resetCoordinate: boolean = true
  ) {
    Object.assign(this._cropper, {
      width,
      height
    });

    this.setPreview(resetCoordinate);

    this.draw();
  }

  set previewScale(scale: number) {
    this.setPreview();
    this.draw();
  }
}
