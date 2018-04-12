import './index.scss';

interface Options {
  delay: number;
}

export default function toast(options: Options) {
  const list: Toast[] = [],
    width = window.innerWidth,
    height = window.innerHeight;

  const defaultRight = width * 0.04,
    defaultTop = height * 0.06,
    marginBottom = width * 0.01,
    marginRight = width * 0.01;

  const computePosition = (current: Toast, prev: Toast) => {
    const currentEl = current.el,
      prevEl = prev.el,
      prevBottomHeight = prev.top + prevEl.offsetHeight + marginBottom;

    // 当前栏高度无法容下元素时切换到另一栏
    if (prevBottomHeight + currentEl.offsetHeight > height) {
      current.setPosition(
        defaultTop,
        prev.right + prevEl.offsetWidth + marginRight
      );
    } else {
      current.setPosition(prevBottomHeight, prev.right);
    }
  };

  return (message: string, delay: number = options.delay) => {
    const t = new Toast(message);

    if (list.length > 0) {
      computePosition(t, list[list.length - 1]);
    } else {
      t.setPosition(defaultTop, defaultRight);
    }

    list.push(t);

    t.show();

    setTimeout(() => {
      t.hide();
      list.splice(0, 1);
      if (list.length > 0) {
        list[0].setPosition(defaultTop, defaultRight);
        if (list.length > 1) {
          for (let i = 1, l = list.length; i < l; i++) {
            computePosition(list[i], list[i - 1]);
          }
        }
      }
    }, delay);
  };
}

class Toast {
  private _el: HTMLElement;
  private _message: string;
  public top: number;
  public right: number;

  constructor(message: string) {
    this._message = message;
    this.init();
  }

  private init() {
    const el = document.createElement('div');

    el.classList.add('toast');

    el.innerHTML = this._message;

    document.body.appendChild(el);

    this._el = el;
  }

  public show = () => {
    this._el.classList.add('show');
  };

  public hide = () => {
    this._el.classList.remove('show');
    this._el.classList.add('hide');

    // this._el.style.animationDuration = duration + 'ms';

    // 简单地用计时器做动画结束判断
    setTimeout(() => {
      document.body.removeChild(this._el);
    }, 300);
  };

  public setPosition(top: number, right: number) {
    const el = this.el;
    this.top = top;
    this.right = right;
    Object.assign(el.style, {
      top: top + 'px',
      right: right + 'px'
    });
  }

  get el(): HTMLElement {
    return this._el;
  }
}
