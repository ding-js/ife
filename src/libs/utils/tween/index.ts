interface Position {
  x: number;
  y: number;
}

interface Options extends Position {
  onUpdate(position: Position): void;
}

export default class Tween {
  private _options: Options;
  private _init: Position;
  private _current: Position;
  private _next: Position;
  private _time: number;
  private _spend: number = 0;
  private _prevTime: number;
  private _complete: boolean = false;

  constructor(options: Options) {
    const { x, y } = options;

    this._init = { x, y };
    this._current = { x, y };
    this._options = options;
  }

  public to(position: Position, time: number) {
    this._next = position;
    this._time = time;

    return this;
  }

  public start() {
    this._prevTime = Date.now();
    this.update();

    return this;
  }

  public update() {
    const now = Date.now();
    this._spend = this._spend + (now - this._prevTime);

    if (this._spend >= this._time) {
      this._complete = true;
      return;
    }

    this._prevTime = now;
    const k = this._spend / this._time;
    this._current = {
      x: this._init.x + (this._next.x - this._init.x) * k,
      y: this._init.y + (this._next.y - this._init.y) * k
    };
    this._options.onUpdate(this._current);
  }

  get complete() {
    return this._complete;
  }
}
