import { debounce } from '@/libs/utils';

interface DatasetResult<T> {
  dataset: Array<T>;
  more: boolean;
}

interface Options<T> {
  /**
   * 列表元素
   *
   * @type {HTMLElement}
   * @memberof Options
   */
  contentElement: HTMLElement;

  /**
   * 真实滚动元素
   *
   * @type {HTMLElement}
   * @memberof Options
   */
  scrollElement?: HTMLElement;
  /**
   * 异步或同步获取数据
   *
   * @param {number} index
   * @returns {(DatasetResult<T> | Promise<DatasetResult<T>>)}
   * @memberof Options
   */
  getDataset(index: number): DatasetResult<T> | Promise<DatasetResult<T>>;

  /**
   * loading 元素 html
   *
   * @type {string}
   * @memberof Options
   */
  loadingHtml?: string;

  /**
   * 无数据时显示元素 html
   *
   * @type {string}
   * @memberof Options
   */
  noDataHtml?: string;
  /**
   * 渲染列表元素
   *
   * @param {T} value
   * @param {number} index
   * @param {Array<T>} array
   * @returns {string}
   * @memberof Options
   */
  render?(value: T, index: number, array: Array<T>): string;
  /**
   * 底部离可视区域的距离，触发更新阈值
   *
   * @type {number}
   * @memberof Options
   */
  threshold?: number;
  /**
   * 当获取所有数据后是否自动销毁
   *
   * @type {boolean}
   * @memberof Options
   */
  autoDestroy?: boolean;
}

export default class InfinitScroll<T> {
  private op: Options<T>;
  private dataset: Array<T> = [];
  private more: boolean = true;
  private loading: boolean = false;
  // 默认值，仅当 scrollElement 也为默认值时生效
  private scrollEventSource: Window | HTMLElement = window;

  constructor(options: Options<T>) {
    const op: Options<T> = {
      contentElement: null,
      scrollElement: document.documentElement,
      getDataset: null,
      noDataHtml: '',
      loadingHtml: '',
      threshold: 400,
      autoDestroy: true,
      render: (value, index) => {
        return `<div>${index}</div>`;
      }
    };

    const necessaryProps = ['contentElement', 'getDataset'];

    for (const prop of necessaryProps) {
      if (!options[prop]) {
        console.warn(`Option: ${prop} can not be empty`);
        return;
      }
    }

    if (options.scrollElement) {
      this.scrollEventSource = options.scrollElement;
    }

    Object.assign(op, options);

    this.op = op;

    this.init();
  }

  private shouldGetDataset() {
    const { scrollElement, threshold } = this.op;

    const top = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;

    return !this.dataset.length || (!this.loading && this.more && top < threshold);
  }

  private async checkDataset() {
    if (this.shouldGetDataset()) {
      await this.fillMoreDataset();

      this.checkDataset();
    }
  }

  private debounceCheckdataset = debounce(() => this.checkDataset(), 100);

  private async fillMoreDataset() {
    this.loading = true;

    const res = await this.op.getDataset(this.dataset.length);

    this.loading = false;

    if (res.dataset && res.dataset.length) {
      this.dataset = this.dataset.concat(res.dataset);

      this.more = res.more;

      if (!this.more && this.op.autoDestroy) {
        this.destroy();
      }

      this.updateView();
    }
  }

  private updateView() {
    const { render, contentElement, noDataHtml, loadingHtml } = this.op;

    let html;

    html = this.dataset.map(render).join('');

    if (!html && !this.loading) {
      html = noDataHtml;
    } else if (this.more) {
      html += loadingHtml;
    }

    contentElement.innerHTML = html;
  }
  /**
   * 销毁
   *
   * @memberof InfinitScroll
   */
  public destroy() {
    this.scrollEventSource.removeEventListener('scroll', this.debounceCheckdataset);
  }

  private init() {
    this.scrollEventSource.addEventListener('scroll', this.debounceCheckdataset);

    this.checkDataset();

    this.updateView();
  }
}
