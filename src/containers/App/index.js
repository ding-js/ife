import { debounce } from '@/libs/utils';
import { getCachedMenuVisible, setCachedMenuVisible } from './storage';
import './index.scss';

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
    window: getWindowSize()
  }),
  computed: {
    expanIcon() {
      return this.shouldMenuVisible
        ? `
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          <path d="M0 0h24v24H0z" fill="none" />
        `
        : `
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          <path d="M0 0h24v24H0z" fill="none" />
        `;
    },
    shouldMenuVisible() {
      if (this.window.width > 767) {
        return true;
      }

      return this.menusVisible;
    }
  },
  render() {
    return (
      <div id="app">
        <header class="page-header">
          <h1 class="logo">
            <router-link to="/">ding-js | ife</router-link>
          </h1>
          <ul class="menu-list" v-show={this.shouldMenuVisible}>
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
          </ul>
          <div class="menu-btn-wrapper">
            <svg
              onClick={this.expandToggle}
              fill="#666"
              height="36"
              viewBox="0 0 24 24"
              width="36"
              xmlns="http://www.w3.org/2000/svg"
              domPropsInnerHTML={this.expanIcon}
            />
          </div>
        </header>
        <div class="page-body">
          <div
            class="content"
            style={{
              minHeight: `${this.window.height - 24 - 80 - 24 - 24}px`
            }}
          >
            <router-view window={this.window} />
          </div>
        </div>
      </div>
    );
  },
  mounted() {
    this.$_resizedUpdateContentHeight = debounce(() => {
      this.window = getWindowSize();
    }, 100);

    window.addEventListener('resize', this.$_resizedUpdateContentHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resizedUpdateContentHeight);
  },
  methods: {
    expandToggle() {
      this.menusVisible = !this.menusVisible;
    }
  },

  watch: {
    menusVisible(visible) {
      setCachedMenuVisible(visible);
    }
  }
};
