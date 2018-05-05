import { debounce } from '@/libs/utils';
import { getCachedMenuVisible, setCachedMenuVisible } from './storage';
import './index.scss';

// 获取视窗宽高
const getWindowSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export default {
  name: 'App',
  data: () => ({
    menus: [
      {
        label: '动画时钟',
        name: 'Clock'
      },
      {
        label: '颜色选择器',
        name: 'ColorPicker'
      },
      {
        label: '图片裁剪器',
        name: 'Cropper'
      },
      {
        label: '无限滚动列表',
        name: 'InfiniteScroll'
      },
      {
        label: '贪食蛇',
        name: 'Snake'
      }
    ],
    menusVisible: getCachedMenuVisible(),
    window: getWindowSize(),
    contentOffsetTop: 0 // 内容区域离页面顶部的距离，用于计算内容区域的最小高度
  }),
  computed: {
    isMobile() {
      return this.window.width < 768;
    },
    shouldMenuVisible() {
      if (!this.isMobile) {
        return true;
      }

      return this.menusVisible;
    }
  },
  render() {
    return (
      <div id="app" class="app">
        <header class="app__header">
          <h1 class="app__logo">
            <a href="https://dingyuchao.me">ding-js</a>
          </h1>
          <nav class="app__nav" v-show={this.shouldMenuVisible}>
            {this.menus.map(menu => (
              <router-link key={menu.name} to={{ name: menu.name }} tag="li">
                <a>{menu.label}</a>
              </router-link>
            ))}
            <li>
              <a
                href={`https://github.com/ding-js/ife/tree/master/src/containers/${
                  this.$route.name
                }`}
                target="_blank"
              >
                查看源码
              </a>
            </li>
          </nav>
          {this.isMobile ? (
            <div>
              <svg
                onClick={this.expandToggle}
                fill="#666"
                height="36"
                width="36"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                class={{
                  'app__nav-btn': true,
                  'app__nav-btn--expand': this.shouldMenuVisible
                }}
              >
                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
                <path d="M0-.75h24v24H0z" fill="none" />
              </svg>
            </div>
          ) : null}
        </header>
        <div class="app__body">
          <div
            class="content"
            ref="content"
            style={{
              minHeight: `${this.window.height - this.contentOffsetTop - 24}px`
            }}
          >
            <router-view window={this.window} />
          </div>
        </div>
      </div>
    );
  },
  mounted() {
    this.$_handleResize = debounce(() => {
      this.window = getWindowSize();
      this.updateContentOffsetHeight();
    }, 100);

    this.updateContentOffsetHeight();

    window.addEventListener('resize', this.$_handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_handleResize);
  },
  methods: {
    expandToggle() {
      this.menusVisible = !this.menusVisible;
    },
    updateContentOffsetHeight() {
      const content = this.$refs.content;

      if (!content) {
        return;
      }

      this.contentOffsetTop = content.offsetTop;
    }
  },

  watch: {
    menusVisible(visible) {
      setCachedMenuVisible(visible);

      this.$nextTick(() => {
        this.updateContentOffsetHeight();
      });
    }
  }
};
