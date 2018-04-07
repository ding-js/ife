import { generateCanvas } from '../utils/canvas';

interface Options {
  /**
   * 时钟半径
   *
   * @type {number}
   * @memberof Options
   */
  radius?: number;
  /**
   * 时钟颜色
   *
   * @type {string}
   * @memberof Options
   */
  color?: string;
  width?: number;
  height?: number;
}

interface Coordinate {
  x?: number;
  y?: number;
}

interface Alarm {
  time: Date;
  cb(): void;
  repeat: boolean;
}

interface Pointer {
  /**
   * 顶点y坐标
   *
   * @type {number}
   * @memberof Pointer
   */
  topY: number;
  /**
   * 底点y坐标
   *
   * @type {number}
   * @memberof Pointer
   */
  bottomY: number;
  /**
   * 角度
   *
   * @type {number}
   * @memberof Pointer
   */
  degree: number;
  /**
   * 底部宽度
   *
   * @type {number}
   * @memberof Pointer
   */
  bottomWidth: number;
  /**
   * 顶部宽度
   *
   * @type {number}
   * @memberof Pointer
   */
  topWidth: number;
}

interface Time {
  date: Date;
  hourDegree: number;
  minuteDegree: number;
  secondDegree: number;
  hour: number;
  minute: number;
  second: number;
}

export default class Clock {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _options: Options;
  /**
   * 与当前时间偏移的毫秒数
   *
   * @private
   * @type {number}
   * @memberof Clock
   */
  private _offset: number = 0;
  private _alarms: Alarm[] = [];

  private _requestId: number;

  constructor(container: HTMLElement | HTMLCanvasElement, options?: Options) {
    const _options: Options = {
      color: '#9b9b9b'
    };

    const r = generateCanvas(container, options, {
      width: 300,
      height: 300
    });

    const canvas = r.canvas;

    this._canvas = canvas;

    this._ctx = canvas.getContext('2d');

    Object.assign(_options, options, {
      width: r.width,
      height: r.height
    });

    const defaultRadius = Math.min(_options.width, _options.height) / 2;

    if (
      !_options.radius ||
      _options.radius > defaultRadius ||
      _options.radius <= 1
    ) {
      _options.radius = defaultRadius;
    }

    this._options = _options;

    this.draw();
  }

  private draw = () => {
    const time = this.getCurrentTime();

    const ctx = this._ctx;

    const { width, height, color, radius } = this._options;

    const center: Coordinate = {
      x: width / 2,
      y: height / 2
    };

    const borderWidth = radius * 0.08;
    const borderRadius = radius - borderWidth / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // 绘制边框
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(center.x, center.y, borderRadius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();

    ctx.save();

    // 绘制刻度
    const distanceToTop = borderWidth + radius * 0.02; // 离边框的距离
    const scaleCount = 5 * 12;

    ctx.fillStyle = color;

    ctx.translate(radius, radius);

    for (let i = 0; i < scaleCount; i++) {
      const scaleWidth = i % 5 === 0 ? radius / 35 : radius / 70;
      const scaleHeight = radius * 0.1;

      const x = -scaleWidth / 2,
        y = distanceToTop - radius;

      ctx.beginPath();
      ctx.rect(x, y, scaleWidth, scaleHeight);
      ctx.fill();
      // 循环结束转完一圈
      ctx.rotate(2 * Math.PI / scaleCount);
    }

    ctx.restore();
    ctx.save();

    // 绘制数字
    const numberRadius = radius - radius * 0.31;

    const fontsize = radius * 0.18;

    ctx.fillStyle = color;
    ctx.font = `${fontsize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 12; i++) {
      const radian = 2 * Math.PI * i / 12;
      // 数字始终是正常阅读的方向，所以不能使用旋转
      const { x, y } = this.getCoordinate(numberRadius, radian);

      ctx.fillText(i.toString(), x, y);
    }

    // 绘制表盘文本
    ctx.font = `${fontsize * 0.6}px sans-serif`;

    // 0|24~11 am , 12~23 pm
    ctx.fillText(`${time.hour < 12 ? 'A.M' : 'P.M'}`, center.x, height * 0.3);

    ctx.restore();

    ctx.save();

    // 绘制指针

    // 三个指针的配置
    const pointers: Pointer[] = [
      {
        topY: -0.72,
        bottomY: 0.24,
        degree: time.secondDegree,
        bottomWidth: 0.02,
        topWidth: 0.01
      },
      {
        topY: -0.6,
        bottomY: 0.18,
        degree: time.minuteDegree,
        bottomWidth: 0.06,
        topWidth: 0.03
      },
      {
        topY: -0.4,
        bottomY: 0.13,
        degree: time.hourDegree,
        bottomWidth: 0.045,
        topWidth: 0.02
      }
    ];

    const tanBottom = Math.tan(Math.PI * 2 * 60 / 360),
      tanTop = Math.tan(Math.PI * 2 * 30 / 360);

    ctx.fillStyle = color;

    pointers.forEach(p => {
      const bottomY = radius * p.bottomY,
        bottomHalf = radius * p.bottomWidth / 2,
        bottomHeight = bottomHalf / tanBottom;

      const topY = radius * p.topY,
        topHalf = radius * p.topWidth / 2,
        topHeight = topHalf / tanTop;

      ctx.translate(radius, radius);
      ctx.rotate(p.degree);

      ctx.beginPath();
      ctx.moveTo(0, bottomY);
      // buttomLeft
      ctx.lineTo(-bottomHalf, bottomY - bottomHeight);

      // topLeft
      ctx.lineTo(-topHalf, topY + topHeight);

      // top
      ctx.lineTo(0, topY);

      // topRight
      ctx.lineTo(topHalf, topY + topHeight);

      // bottomRight
      ctx.lineTo(bottomHalf, bottomY - bottomHeight);

      // bottom
      ctx.lineTo(0, bottomY);

      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    ctx.restore();
    ctx.save();

    // 绘制中点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 0.02, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

    this.checkAlarms(time.date);

    this._requestId = window.requestAnimationFrame(this.draw);
  };
  /**
   * 根据半径和角度获取改点的坐标
   *
   * @private
   * @param {number} radius
   * @param {number} radian
   * @returns {Coordinate}
   * @memberof Clock
   */
  private getCoordinate(radius: number, radian: number): Coordinate {
    const r = this._options.radius;

    return {
      x: r + radius * Math.sin(radian),
      y: r - radius * Math.cos(radian)
    };
  }

  // 获取计算过偏移的时间
  private getCurrentTime(): Time {
    const now = new Date();

    const date =
      typeof this._offset === 'number'
        ? new Date(now.getTime() + this._offset)
        : now;

    const [hour, minute, second, milliSecond] = [
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    ];

    // 时针、分针、秒针可以百分比移动
    const exactS = second + milliSecond / 1000,
      exactM = minute + exactS / 60,
      exactH = hour + exactM / 60;

    const [hourDegree, minuteDegree, secondDegree] = [
      exactH / 12,
      exactM / 60,
      exactS / 60
    ].map(v => v * 2 * Math.PI);

    return {
      date,
      hourDegree,
      minuteDegree,
      secondDegree,
      hour,
      minute,
      second
    };
  }

  // 检验触发闹钟
  private checkAlarms(date: Date) {
    const alarms = this._alarms;
    if (!alarms || !alarms.length) {
      return;
    }

    for (let i = 0; i < alarms.length; i++) {
      const alarm = alarms[i];

      if (Math.abs(date.getTime() - alarm.time.getTime()) < 500) {
        if (!alarm.repeat) {
          this._alarms.splice(i, i + 1);
          i--;
        }
        alarm.cb();
      }
    }
  }
  /**
   * 增加闹钟
   *
   * @param {Date} time
   * @param {() => void} cb
   * @param {boolean} [repeat=true] 是否每天重复
   * @memberof Clock
   */
  public addAlarm(time: Date, cb: () => void, repeat = true) {
    if (!this._alarms) {
      this._alarms = [];
    }

    this._alarms.push({
      time,
      cb,
      repeat
    });
  }
  /**
   * 清除所有闹钟
   *
   * @memberof Clock
   */
  public clearAlarms() {
    this._alarms = [];
  }

  public destroy(removeCanvas: boolean = true) {
    if (this._requestId) {
      window.cancelAnimationFrame(this._requestId);
    }

    if (removeCanvas && this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  }

  set offset(time: number) {
    this._offset = time;
  }

  get offset() {
    return this._offset;
  }

  get alarms() {
    return this._alarms;
  }
}
