<template>
  <div id="app">
    <header class="page-header">
      <h1 class="logo">
        <router-link to="/">ding-js | ife</router-link>
      </h1>
      <ul class="menu-list" v-show="menusVisible">
        <router-link v-for="menu in menus" :key="menu.path" :to="'/'+menu.path" tag="li">
          <a>
            {{menu.label}}
          </a>
        </router-link>
      </ul>
      <div class="menu-btn-wrapper">
        <svg @click="expandLess" v-if="menusVisible" fill="#666" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
        <svg @click="expandMore" v-else fill="#666" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
      </div>
    </header>

    <div class="page-body">
      <div class="content" :style="style" ref="content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from '@/libs/utils';
// 缓存在本地sting类型的menusVisible
const cachedMenusVisible = localStorage.getItem('menusVisible');
export default {
  name: 'App',
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
    expandMore() {
      this.menusVisible = true;
    },
    expandLess() {
      this.menusVisible = false;
    }
  },
  data: () => ({
    menus: [
      {
        label: '动画时钟',
        path: 'clock'
      },
      {
        label: '颜色选择器',
        path: 'color-picker'
      },
      {
        label: '图片裁剪器',
        path: 'cropper'
      },
      {
        label: '无限滚动列表',
        path: 'infinite-scroll'
      },
      {
        label: '贪食蛇',
        path: 'snake'
      }
    ],
    menusVisible: window.innerWidth > 767 ? true : (cachedMenusVisible ? JSON.parse(cachedMenusVisible) : false),
    style: {}
  }),
  watch: {
    menusVisible() {
      this.$nextTick(this.updateContentHeight);
      localStorage.setItem('menusVisible', this.menusVisible);
    }
  }
};
</script>


<style lang="scss" scoped>
.menu-btn-wrapper {
  display: none;
  svg {
    cursor: pointer;
  }
}
.page-header {
  height: 80px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  margin-bottom: 24px;
  padding: 0 48px;
}
.page-body {
  margin: 0 48px 24px;
  background-color: #fff;
  border-radius: 4px;
  padding-top: 24px;
}
.logo {
  text-transform: uppercase;
  margin: 0;
  float: left;
  line-height: 80px;
  font-size: 18px;
  user-select: none;
}
.menu-list {
  float: right;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
  li {
    display: inline-block;
    height: 80px;
    line-height: 80px;
    transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
      border-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    padding: 0 20px;
    border-bottom: 3px solid transparent;
    color: rgba(0, 0, 0, 0.65);
    &:hover,
    &.router-link-active {
      border-bottom-color: #108ee9;
      color: #108ee9;
    }
  }
  a {
    display: block;
    color: inherit;
  }
}

@media screen and(max-width: 767px) {
  .menu-btn-wrapper {
    display: block;
    text-align: center;
  }
  .page-header {
    height: auto;
    min-height: 60px;
    text-align: center;
  }
  .logo {
    height: 60px;
    line-height: 60px;
  }
  .logo,
  .menu-list {
    float: none;
  }
  .menu-list {
    li {
      display: block;
      height: 48px;
      line-height: 48px;
      border-bottom: none;
    }
  }
  .page-body {
    margin: 0 0 24px;
  }
}
</style>

