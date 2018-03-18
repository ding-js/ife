import Tween from '@/libs/utils/tween';
import { generateCanvas } from '@/libs/utils';

enum BoxState {
  empty,
  wall,
  body,
  head,
  footer,
  food
}

enum Direction {
  left,
  right,
  up,
  down
}

enum GameStatus {
  beforeStart,
  end,
  pause,
  runing,
  disabled
}

interface IDirection {
  x: number;
  y: number;
  keyCode: number[];
  opposite: number;
}

interface ISnakeOptions {
  width?: number;
  height?: number;
  sideLength?: number;
  origin?: {
    x: number;
    y: number;
  }[];

  /**
   *
   *
   * @param {number} scroe
   * @param {number} speed
   * @param {Snake} ref
   * @returns {Boolean} 是否继续行动，一般用于判定满足足够的分数后进入下一关
   * @memberof ISnakeOptions
   */
  scoreCallback?(scroe: number, speed: number, ref: Snake): Boolean;
  endCallback?(reason: string, ref: Snake): void;
  pauseCallback?(ref: Snake): void;
  continueCallback?(ref: Snake): void;
}

interface IContent {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  colums: number;
}

interface Ibox {
  x: number;
  y: number;
  xIndex: number;
  yIndex: number;
  type: BoxState;
  animateX?: number;
  animateY?: number;
}

interface IBoxType {
  background?: string;
  render?(ctx: CanvasRenderingContext2D, x: number, y: number, sideLength: number): void;
}

export class Snake {
  private _options: ISnakeOptions;
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _content: IContent;
  private _boxes: Ibox[][] = [];
  private _snake: Ibox[];
  private _food: Ibox[];
  private _wall: Ibox[];
  private _snakeDirection: Direction;
  private _keys: Direction[];
  private _status: GameStatus;
  private _speed: number = 1;
  private _animation: {
    id: number;
    cb(time: number): void;
    tweens: Tween[];
  };

  private _boxTypes: {
    [key: number]: IBoxType;
  } = {
    [BoxState.empty]: {},
    [BoxState.wall]: {
      background: 'brown'
    },
    [BoxState.head]: {
      background: '#555',
      render: (ctx, x, y, sideLength) => {
        const k = sideLength / 14, // 基数
          d = this._direction[this._snakeDirection],
          r = sideLength / 2,
          eyes = [
            {
              x: x + r + d.x * k * 3 + (d.x === 0 ? k * 2.5 : 0),
              y: y + r + d.y * k * 3 + (d.y === 0 ? k * 2.5 : 0)
            },
            {
              x: x + r + d.x * k * 3 + (d.x === 0 ? -k * 2.5 : 0),
              y: y + r + d.y * k * 3 + (d.y === 0 ? -k * 2.5 : 0)
            }
          ];
        ctx.fillStyle = '#fff';

        eyes.forEach((eye) => {
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, 2 * k, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },
    [BoxState.body]: {
      render: (ctx, x, y, sideLength) => {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(x + sideLength / 2, y + sideLength / 2, sideLength / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [BoxState.footer]: {
      render: (ctx, x, y, sideLength) => {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(x + sideLength / 2, y + sideLength / 2, sideLength * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [BoxState.food]: {
      background: 'orange'
    }
  };

  private _direction: {
    [key: number]: IDirection;
  } = {
    [Direction.left]: {
      x: -1,
      y: 0,
      keyCode: [65, 37],
      opposite: Direction.right
    },
    [Direction.right]: {
      x: 1,
      y: 0,
      keyCode: [68, 39],
      opposite: Direction.left
    },
    [Direction.up]: {
      x: 0,
      y: -1,
      keyCode: [87, 38],
      opposite: Direction.down
    },
    [Direction.down]: {
      x: 0,
      y: 1,
      keyCode: [83, 40],
      opposite: Direction.up
    }
  };

  constructor(container: HTMLElement | HTMLCanvasElement, options?: ISnakeOptions) {
    const _options: ISnakeOptions = {
      sideLength: 18
    };

    const r = generateCanvas(container, options);

    Object.assign(_options, options, { width: r.width, height: r.height });

    if (!_options.origin) {
      _options.origin = [];
      for (let i = 6; i > 2; i--) {
        _options.origin.push({
          x: i,
          y: 4
        });
      }
    }

    const side = _options.sideLength,
      pdV = (_options.width % side) / 2,
      pdH = (_options.height % side) / 2,
      width = _options.width - pdH * 2,
      height = _options.height - pdV * 2;

    this._content = {
      x: pdH,
      y: pdV,
      width: width,
      height: height,
      rows: width / side,
      colums: height / side
    };

    this._canvas = r.canvas;

    this._options = _options;

    this.init();
  }

  private init() {
    const op = this._options,
      canvas = this._canvas,
      ctx = canvas.getContext('2d'),
      content = this._content,
      side = op.sideLength;

    this._ctx = ctx;

    // 初始化地图格
    for (let x = 0; x < content.colums; x++) {
      const colum: Ibox[] = [];
      for (let y = 0; y < content.rows; y++) {
        colum.push({
          x: content.x + x * side,
          y: content.y + y * side,
          xIndex: x,
          yIndex: y,
          type: BoxState.empty
        });
      }
      this._boxes.push(colum);
    }

    this.reset();

    this.drawMap();

    this._status = GameStatus.disabled;

    document.addEventListener('keydown', this.handleKeyboard);
  }

  private handleKeyboard = (e) => {
    const direction = this._direction,
      code = e.keyCode,
      status = this._status;

    switch (code) {
      case 32:
        e.preventDefault();
        switch (status) {
          case GameStatus.pause:
            this.continue();
            break;
          case GameStatus.runing:
            this.pause();
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    for (let i in direction) {
      if (direction[i].keyCode.indexOf(code) > -1) {
        e.preventDefault();
        if (status === GameStatus.runing) {
          this._keys.push(+i);
        } else if (status === GameStatus.beforeStart) {
          this._keys.push(+i);
          this.start();
        }
      }
    }
  };

  private getBox(x: number, y: number): Ibox {
    const boxes = this._boxes;
    const colum = boxes[x];

    if (!colum) {
      return;
    }

    return colum[y];
  }

  private info(msgs: string | string[], fontSize: number = 24) {
    const ctx = this._ctx,
      op = this._options,
      content = this._content;

    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(content.x, content.y, content.width, content.height);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + fontSize + 'px serif';

    if (!Array.isArray(msgs)) {
      msgs = [msgs];
    }

    msgs.forEach((msg, index) => {
      ctx.fillText(
        msg,
        op.width * 0.5,
        op.height * 0.4 + op.sideLength * fontSize * 1.1 * index,
        content.width - op.sideLength * 2
      );
    });

    ctx.restore();
  }

  private drawBox(box: Ibox) {
    const types = this._boxTypes,
      ctx = this._ctx,
      side = this._options.sideLength;

    const type = types[box.type],
      x = box.animateX ? box.animateX : box.x,
      y = box.animateY ? box.animateY : box.y;

    if (type.background) {
      ctx.save();
      ctx.fillStyle = type.background;
      ctx.fillRect(x, y, side, side);
      ctx.restore();
    }

    if (type.render) {
      ctx.save();
      type.render(ctx, x, y, side);
      ctx.restore();
    }
  }

  private drawMap() {
    const op = this._options,
      ctx = this._ctx,
      content = this._content,
      side = op.sideLength;

    ctx.save();

    // 绘制地图线
    ctx.beginPath();

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let x = 0; x <= content.colums; x++) {
      const xC = content.x + x * side;
      ctx.moveTo(xC, content.y);
      ctx.lineTo(xC, content.y + content.height);
    }

    for (let y = 0; y <= content.rows; y++) {
      const yC = content.y + y * side;
      ctx.moveTo(content.x, yC);
      ctx.lineTo(content.x + content.width, yC);
    }

    ctx.stroke();

    ctx.restore();
  }

  private drawContent() {
    this._ctx.save();
    this._food.forEach((box) => {
      this.drawBox(box);
    });

    this._boxes.forEach((column) => {
      column.forEach((box) => {
        const type = box.type;
        if (type !== BoxState.food) {
          this.drawBox(box);
        }
      });
    });

    this._ctx.restore();
  }

  private draw() {
    const op = this._options,
      ctx = this._ctx;

    ctx.clearRect(0, 0, op.width, op.height);

    this.drawMap();

    this.drawContent();
  }

  private updateAnimation(tweens: Tween[], cb) {
    this._animation = {
      cb: cb,
      id: requestAnimationFrame(cb),
      tweens: tweens
    };
  }

  private createTween(now: Ibox, next: Ibox, timeout: number): Tween {
    const t = new Tween({
      x: now.x,
      y: now.y,
      onUpdate(positon) {
        Object.assign(now, {
          animateX: positon.x,
          animateY: positon.y
        });
      }
    })
      .to({ x: next.x, y: next.y }, timeout)
      .start();

    return t;
  }

  private updateDirection() {
    const keys = this._keys,
      keysLen = keys.length;

    // 根据键盘输入转向
    if (keysLen > 0) {
      for (let i = keysLen - 1; i >= 0; i--) {
        const type = keys[i];

        // 不冲突时更新方向
        if (
          type !== this._snakeDirection &&
          type !== this._direction[this._snakeDirection].opposite
        ) {
          this._snakeDirection = type;
          // 允许连续键多次操作
          this._keys = keys.slice(i + 1);
          break;
        }
      }
    }
  }

  private next = () => {
    if (this._status !== GameStatus.runing) {
      return;
    }

    this.updateDirection();

    // 动效时间
    const timeout = this._speed > 30 ? 1 : 300 - this._speed * 10;

    const snake = this._snake,
      direction = this._direction[this._snakeDirection],
      content = this._content;

    const head = snake[0],
      footer = snake[snake.length - 1],
      x = head.xIndex + direction.x,
      y = head.yIndex + direction.y;

    const box = this.getBox(x, y);

    if (box && x >= 0 && x < content.colums && y >= 0 && y < content.rows) {
      const tweenList = [this.createTween(head, box, timeout)];

      const animationComplete = () => {
        let shouldNext = true;
        snake.forEach((snakeBox) => {
          delete snakeBox.animateX;
          delete snakeBox.animateY;
        });

        switch (box.type) {
          case BoxState.empty:
            footer.type = BoxState.empty;
            snake.pop();
            break;
          case BoxState.food:
            const c = this.eat(box);
            // 不继续执行
            if (c !== undefined && !c) {
              shouldNext = false;
            }
            break;
          default:
            return;
        }

        snake.unshift(box);

        this.updateSnake();

        if (shouldNext && this._status === GameStatus.runing) {
          this.next();
        }

        this.draw();
      };

      const animationCb = (time) => {
        let complete = true;

        tweenList.forEach((t) => {
          t.update();
          if (complete && !t.complete) {
            complete = false;
          }
        });

        this.draw();

        if (!complete) {
          this.updateAnimation(tweenList, animationCb);
        } else {
          this._animation = null;
          animationComplete();
        }
      };

      if (box.type === BoxState.body || box.type === BoxState.footer) {
        this.draw(); // 转向
        this.endGame('红烧蛇肉!');
        return;
      } else if (box.type === BoxState.wall) {
        this.draw(); // 转向
        this.endGame('撞墙!');
        return;
      }

      for (let i = 1, l = snake.length; i < l; i++) {
        const thisBox = snake[i],
          nextBox = snake[i - 1];
        tweenList.push(this.createTween(thisBox, nextBox, timeout));
      }

      this.updateAnimation(tweenList, animationCb);
    } else {
      this.endGame('撞边界啦!');
    }
  };

  private updateSnake() {
    const snake = this._snake;

    snake.forEach((snakeBox) => {
      snakeBox.type = BoxState.body;
    });

    snake[0].type = BoxState.head;

    snake[snake.length - 1].type = BoxState.footer;
  }

  public reset() {
    this._status = GameStatus.beforeStart;

    this._food = [];

    this._wall = [];

    this._keys = [];

    this._snakeDirection = Direction.right;

    this._boxes.forEach((column) => {
      column.forEach((box) => {
        box.type = BoxState.empty;
      });
    });

    this._snake = this._options.origin.map((cords) => this.getBox(cords.x, cords.y));

    this.updateSnake();

    this.createFood();
  }

  public start() {
    this._status = GameStatus.runing;

    this.draw();

    this.next();
  }

  private pauseGame(cb) {
    if (this._status === GameStatus.runing) {
      if (this._animation) {
        cancelAnimationFrame(this._animation.id);

        // this._animation.tweens.forEach((t) => {
        //   if (!t.complete) {
        //     // t.spend = new Date().getTime() - t.startTime;
        //     // t.tween.stop();
        //   }
        // });

        cb();
      } else {
        requestAnimationFrame(() => {
          this.pauseGame(cb);
        });
      }
    }
  }

  private pause() {
    this.pauseGame(() => {
      this._status = GameStatus.pause;
      this.info('Pause');
    });
  }

  private continue() {
    if (this._status === GameStatus.pause) {
      if (this._animation) {
        this._animation.tweens.forEach((t) => {
          if (!t.complete) {
            t.start();
          }
        });

        this._status = GameStatus.runing;

        this.updateAnimation(this._animation.tweens, this._animation.cb);
      } else {
        this.continue();
      }
    }
  }

  private eat(box) {
    const scroe = this._snake.length - this._options.origin.length + 1;
    const food = this._food;

    this._food = food.splice(food.indexOf(box));

    this.createFood();

    if (this._options.scoreCallback) {
      return this._options.scoreCallback(scroe, this.speed, this);
    }
  }

  public endGame(reason: string) {
    if (this._options.endCallback) {
      this._options.endCallback(reason, this);
    }
    this._status = GameStatus.end;
  }

  private createFood() {
    const content = this._content,
      x = Math.floor(Math.random() * content.colums),
      y = Math.floor(Math.random() * content.rows),
      box = this.getBox(x, y);

    if (box.type === BoxState.empty) {
      box.type = BoxState.food;
    } else {
      return this.createFood();
    }

    this._food.push(box);
    return box;
  }

  public nextLevel(msg: string) {
    this.pauseGame(() => {
      this.info(msg);
      this._status = GameStatus.end;
    });
  }

  public fillWall(walls: number) {
    const content = this._content;
    let i = 0;
    while (i < walls) {
      const box = this.getBox(
        Math.floor(Math.random() * content.colums),
        Math.floor(Math.random() * content.rows)
      );
      if (box.type === BoxState.empty) {
        box.type = BoxState.wall;
        this._wall.push(box);
        i++;
      }
    }
  }

  public disable() {
    const lastStatus = this._status;
    this._status = GameStatus.disabled;

    return () => {
      this._status = lastStatus;
    };
  }

  public prepareStart() {
    this.reset();
    this.draw();
  }

  set speed(speed: number) {
    this._speed = speed;
  }

  get speed() {
    return this._speed;
  }
}
