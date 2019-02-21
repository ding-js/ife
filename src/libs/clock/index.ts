import { isNumber } from '../utils';
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
   * 时钟颜色，当前只支持单色
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
  repeat: boolean;
  cb(): void;
}

/**
 * 时钟指针位置描述
 *
 * @interface Hand
 */
interface Hand {
  /**
   * 指针尖端到圆心的距离换算成 (center，center) 坐标系 y 的系数
   *
   * @type {number}
   * @memberof Pointer
   */
  topY: number;
  /**
   * 尾部 y
   *
   * @type {number}
   * @memberof Pointer
   */
  bottomY: number;
  /**
   * 顶部宽度
   *
   * @type {number}
   * @memberof Pointer
   */
  topWidth: number;
  /**
   * 底部宽度
   *
   * @type {number}
   * @memberof Pointer
   */
  bottomWidth: number;
  /**
   * 指针转过的角度
   *
   * @type {number}
   * @memberof Pointer
   */
  degree: number;
}

/**
 * 当前时间的时分秒和和对应指针旋转的角度
 *
 * @interface Time
 */
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
   * 与 UTC 时间偏移的毫秒数
   *
   * @private
   * @type {number}
   * @memberof Clock
   */
  private _offset: number;
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

    Object.assign(_options, options, {
      width: r.width,
      height: r.height
    });
    // 时钟半径
    const defaultRadius = Math.min(_options.width, _options.height) / 2;

    if (!_options.radius || _options.radius > defaultRadius || _options.radius <= 1) {
      _options.radius = defaultRadius;
    }

    this._options = _options;
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this.offset = undefined; // 设置当前时区偏移
    this._draw();
  }

  private _draw() {
    const ctx = this._ctx;
    const { width, height } = this._options;
    const time = this._getCurrentTime();

    ctx.clearRect(0, 0, width, height);

    this._drawClockDial();
    this._drawClockHands();

    this._checkAlarms(time.date);
    this._requestId = window.requestAnimationFrame(() => this._draw());
  }

  private _drawClockDial() {
    const ctx = this._ctx;
    const { width, height, color, radius } = this._options;
    const center: Coordinate = {
      x: width / 2,
      y: height / 2
    };
    const borderWidth = radius * 0.08;
    const borderCenterToCenter = radius - borderWidth / 2;
    const time = this._getCurrentTime();

    ctx.save();
    // 绘制边框
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;

    ctx.beginPath();
    ctx.arc(center.x, center.y, borderCenterToCenter, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
    ctx.save();

    // 绘制刻度，实际是一堆矩形
    const calibrationCount = 5 * 12;
    const calibrationHeight = radius * 0.1;
    const calibrationTopToEdge = radius * 0.02 + borderWidth;
    const mainCalibrationWidth = radius * 0.028;
    const normalCalibrationWidth = mainCalibrationWidth / 2;

    ctx.fillStyle = color;
    // 把坐标点设为中心方便旋转
    ctx.translate(center.x, center.y);

    for (let i = 0; i < calibrationCount; i++) {
      // 准点刻度和其他刻度
      const calibrationWidth = i % 5 === 0 ? mainCalibrationWidth : normalCalibrationWidth;
      const x = -calibrationWidth / 2;
      const y = -radius + calibrationTopToEdge;

      ctx.beginPath();
      ctx.rect(x, y, calibrationWidth, calibrationHeight);
      ctx.fill();
      ctx.rotate((2 * Math.PI) / calibrationCount);
    }

    ctx.restore();
    ctx.save();

    // 绘制数字
    const numberTopToCenter = radius * 0.69;
    const fontsize = radius * 0.18;

    ctx.fillStyle = color;
    ctx.font = this._generateCtxFont(fontsize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 数字始终是正常阅读的方向，所以不能使用旋转
    for (let i = 1; i <= 12; i++) {
      const radian = (2 * Math.PI * i) / 12;
      const x = radius + numberTopToCenter * Math.sin(radian);
      const y = radius - numberTopToCenter * Math.cos(radian);

      ctx.fillText(i.toString(), x, y);
    }
    // 绘制表盘文本
    ctx.font = this._generateCtxFont(fontsize * 0.6);

    // 0|24~11 am , 12~23 pm
    ctx.fillText(`${time.hour < 12 ? 'A.M' : 'P.M'}`, center.x, height * 0.3);

    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private _drawClockHands() {
    const ctx = this._ctx;
    const { width, height, color, radius } = this._options;
    const center: Coordinate = {
      x: width / 2,
      y: height / 2
    };
    const time = this._getCurrentTime();
    // 绘制指针的配置
    const hands: Hand[] = [
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
    const tanTop = Math.tan((Math.PI * 2 * 30) / 360); // 顶部 30 度
    const tanBottom = Math.tan((Math.PI * 2 * 60) / 360); // 底部 60 度

    ctx.save();
    ctx.fillStyle = color;

    hands.forEach(p => {
      const bottomY = radius * p.bottomY;
      const bottomHalf = (radius * p.bottomWidth) / 2;
      const bottomHeight = bottomHalf / tanBottom;
      const topY = radius * p.topY;
      const topHalf = (radius * p.topWidth) / 2;
      const topHeight = topHalf / tanTop;

      // 三根指针需要在独立的画布上旋转
      ctx.setTransform(1, 0, 0, 1, center.x, center.y);
      ctx.rotate(p.degree);
      ctx.beginPath();

      ctx.moveTo(0, bottomY); // bottom
      ctx.lineTo(-bottomHalf, bottomY - bottomHeight); // bottomLeft
      ctx.lineTo(-topHalf, topY + topHeight); // topLeft
      ctx.lineTo(0, topY); // top
      ctx.lineTo(topHalf, topY + topHeight); // topRight
      ctx.lineTo(bottomHalf, bottomY - bottomHeight); // bottomRight
      ctx.lineTo(0, bottomY); // bottom

      ctx.fill();
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.restore();
    ctx.save();

    // 绘制中点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 0.02, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  private _generateCtxFont(fontsize: number) {
    return `${fontsize.toFixed(2)}px Arial, Helvetica, sans-serif`;
  }

  // 获取计算过偏移的时间
  private _getCurrentTime(): Time {
    const now = new Date();
    const date = isNumber(this._offset) ? new Date(now.getTime() + this._offset) : now;
    const [hour, minute, second, millisecond] = [
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    ];

    // 时针、分针、秒针可以百分比移动
    const exactS = second + millisecond / 1000;
    const exactM = minute + exactS / 60;
    const exactH = hour + exactM / 60;

    const [hourDegree, minuteDegree, secondDegree] = [exactH / 12, exactM / 60, exactS / 60].map(
      v => v * 2 * Math.PI
    );

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
  private _checkAlarms(clockDate: Date) {
    const alarms = this._alarms;
    if (!alarms || !alarms.length) {
      return;
    }

    for (let i = 0; i < alarms.length; i++) {
      const alarm = alarms[i];
      const offset = alarm.time.getTimezoneOffset() * 60 * 1000;
      // clockDate 是计算过时区偏移的，而 alarm.time 是不计算的，这边对比的时候要加上偏移
      if (Math.abs(clockDate.getTime() - alarm.time.getTime() + offset) < 500) {
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

  public destroy() {
    if (this._requestId) {
      window.cancelAnimationFrame(this._requestId);
    }

    if (this._canvas) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  }

  set offset(time: number) {
    this._offset = isNumber(time) ? time : -new Date().getTimezoneOffset() * 60 * 1000;
  }

  get offset() {
    return this._offset;
  }

  get alarms() {
    return this._alarms;
  }
}
