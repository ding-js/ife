interface IClockOptions {
  radius?: number;
  color?: string;
}

interface ICoordinate {
  x?: number;
  y?: number;
}

interface IAlarm {
  time: Date;
  cb: Function;
}

export default class Clock {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;
  private _radius: number;
  private _options: IClockOptions;
  private _timeOffset: number;
  private _alarm: IAlarm[];

  constructor(canvas: HTMLCanvasElement, options?: IClockOptions) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._width = +canvas.getAttribute('width') || 300;
    this._height = +canvas.getAttribute('height') || 300;
    const _option: IClockOptions = {
      radius: Math.min(this._width, this._height) / 2,
      color: '#9b9b9b'
    };

    if (options) {
      if (options.radius && (options.radius > _option.radius || options.radius <= 1)) {
        options.radius = _option.radius;
      }
    }

    Object.assign(_option, options);

    this._radius = _option.radius;

    this._options = _option;

    window.requestAnimationFrame(this.draw);

  }

  private draw = () => {
    const time = this.getCurrentTime();
    const ctx = this._ctx,
      width = this._width,
      height = this._height,
      center: ICoordinate = {
        x: width / 2,
        y: height / 2
      },
      op = this._options,
      color = op.color,
      radius = op.radius,
      borderWidth = radius * 0.08;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 绘制边框
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius - borderWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();

    ctx.save();

    // 绘制刻度
    const distance2Top = borderWidth + radius * 0.02;

    ctx.fillStyle = color;

    ctx.translate(radius, radius);

    // 提前量
    ctx.rotate(-Math.PI / 30);

    for (let i = 0; i < 60; i++) {
      const scaleWidth = i % 5 === 0 ? radius / 35 : radius / 70,
        scaleHeight = radius / 10;

      const x = -scaleWidth / 2,
        y = distance2Top - radius;

      ctx.rotate(Math.PI / 30);
      ctx.beginPath();
      ctx.rect(x, y, scaleWidth, scaleHeight);
      ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.restore();
    ctx.save();

    // 绘制数字
    const numberRadius = radius - (borderWidth + distance2Top + radius * 0.13);

    const font = radius * 0.18;
    ctx.fillStyle = color;
    ctx.font = `${font}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 12; i++) {
      const radian = i / 12 * 2 * Math.PI;
      const coordinate = this.getCoordinate(numberRadius, radian),
        x = coordinate.x,
        y = coordinate.y;
      ctx.fillText('' + i, x, y);
    }

    // 绘制表盘文字

    ctx.font = `${font * 0.6}px sans-serif`;
    ctx.fillText(`${time.h > 12 ? 'P.M' : 'A.M'}`, center.x, height * 0.3);

    ctx.restore();
    ctx.save();
    // 绘制指针

    const pointerList = [
      {
        top: 0.72,
        bottom: 0.24,
        r: time.sR,
        bottomWidth: 0.02,
        topWidth: 0.01
      },
      {
        top: 0.6,
        bottom: 0.18,
        r: time.mR,
        bottomWidth: 0.06,
        topWidth: 0.03
      },
      {
        top: 0.4,
        bottom: 0.13,
        r: time.hR,
        bottomWidth: 0.045,
        topWidth: 0.02
      }
    ];

    const tanBottom = Math.tan(Math.PI * 60 / 180),
      tanTop = Math.tan(Math.PI * 30 / 180);

    ctx.fillStyle = color;

    pointerList.forEach(p => {
      const bottom = radius * p.bottom,
        bottomWidth = radius * p.bottomWidth / 2,
        bottomHeight = bottomWidth / tanBottom;

      const top = radius * p.top,
        topWidth = radius * p.topWidth / 2,
        topHeight = topWidth / tanTop;
      ctx.translate(radius, radius);
      ctx.rotate(p.r);
      ctx.beginPath();
      ctx.moveTo(0, bottom);
      // buttomLeft
      ctx.lineTo(-bottomWidth, bottom - bottomHeight);

      // topLeft
      ctx.lineTo(-topWidth, -top + topHeight);

      // top
      ctx.lineTo(0, -top);

      // topRight
      ctx.lineTo(topWidth, -top + topHeight);

      // bottomRight
      ctx.lineTo(bottomWidth, bottom - bottomHeight);

      // bottom
      ctx.lineTo(0, bottom);

      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    ctx.restore();
    ctx.save();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 0.02, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

    this.triggerAlarm(time.date);

    window.requestAnimationFrame(this.draw);
  }

  private getCoordinate(radius: number, radian: number): ICoordinate {
    const r = this._radius;

    return {
      x: r + radius * Math.sin(radian),
      y: r - radius * Math.cos(radian)
    };
  }

  // 获取正确的时间
  private getCurrentTime() {
    const now = new Date();
    let date;

    if (this._timeOffset) {
      date = new Date(now.getTime() + this._timeOffset);
    } else {
      date = now;
    }

    const [h, m, s, ms] = [
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    ];

    const cS = s + ms / 1000,
      cM = m + cS / 60,
      cH = h + cM / 60;

    const [hR, mR, sR] = [cH / 12, cM / 60, cS / 60].map(v => v * 2 * Math.PI);
    return {
      hR, mR, sR, date, h, s, m
    };
  }

  // 检验触发闹钟
  private triggerAlarm(date: Date) {
    const alarms = this._alarm;
    if (!alarms || alarms.length <= 0) {
      return;
    }

    const deleteAlarms: {
      index: number;
      alarm: IAlarm;
    }[] = [];

    alarms.forEach((alarm, index) => {
      if (Math.abs(date.getTime() - alarm.time.getTime()) < 100) {
        // 不在这里出发回调是因为回调发生时_alarm还没有改变
        deleteAlarms.push({
          index: index,
          alarm: alarm
        });
      }
    });

    deleteAlarms.forEach((deleteAlarm, index) => {
      // 每次移除之后数组的长度就会变化,所以是升序,所以直接减去这个循环的index就正确的索引
      const currentIndex = deleteAlarm.index - index;
      this._alarm.splice(currentIndex, currentIndex + 1);
      deleteAlarm.alarm.cb();
    });
  }

  // 设置闹钟
  public setAlarm(time: Date, cb: Function) {
    if (!this._alarm) {
      this._alarm = [];
    }

    this._alarm.push({
      time,
      cb
    });
  }

  public clearAlarm() {
    this._alarm = [];
  }

  set offset(time: number) {
    this._timeOffset = time;
  }

  get alarm() {
    return this._alarm;
  }
}
