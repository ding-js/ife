import { debounce } from '@/libs/utils';
import { getCachedMenuVisible, setCachedMenuVisible } from './storage';
import './index.scss';

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
    menusVisible: window.innerWidth > 767 ? true : getCachedMenuVisible(),
    style: {}
  }),
  computed: {
    expanIcon() {
      return this.menusVisible
        ? `
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          <path d="M0 0h24v24H0z" fill="none" />
        `
        : `
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          <path d="M0 0h24v24H0z" fill="none" />
        `;
    }
  },
  render() {
    return (
      <div id="app">
        <header class="page-header">
          <h1 class="logo">
            <router-link to="/">ding-js | ife</router-link>
          </h1>
          <ul
            class="menu-list"
            style={
              this.menusVisible
                ? {}
                : {
                    display: 'none'
                  }
            }
          >
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
          <div class="content" style={this.style} ref="content">
            <router-view />
          </div>
        </div>
      </div>
    );
  },
  created() {
    // 兼容来自 http://ife.baidu.com
    const path = location.href;

    if (/\.html$/.test(path)) {
      const htmlMatch = path.match(/([^/]+)\.html$/);
      const htmlName = htmlMatch && htmlMatch[1];

      const routeMap = {
        colorpicker: 'ColorPicker',
        clock: 'Clock',
        cropper: 'Cropper',
        'infinite-scroll': 'InfiniteScroll',
        snake: 'Snake'
      };

      if (htmlName && routeMap[htmlName]) {
        this.$router.replace({
          name: routeMap[htmlName]
        });
      }
    }
  },
  mounted() {
    this.$_resizedUpdateContentHeight = debounce(() => {
      this.updateContentHeight();
      // 避免小屏切换到大屏时菜单不显示
      if (window.innerWidth > 767) {
        this.menusVisible = true;
      }
    }, 100);

    this.updateContentHeight();

    window.addEventListener('resize', this.$_resizedUpdateContentHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resizedUpdateContentHeight);
  },
  methods: {
    updateContentHeight() {
      const content = this.$refs.content;

      if (content) {
        this.style = {
          minHeight: window.innerHeight - content.offsetTop - 24 + 'px'
        };
      }
    },
    expandToggle() {
      this.menusVisible = !this.menusVisible;
    }
  },

  watch: {
    menusVisible(visible) {
      this.$nextTick(this.updateContentHeight);
      setCachedMenuVisible(visible);
    }
  }
};
