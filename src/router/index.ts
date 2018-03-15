import Vue from 'vue';
import Router from 'vue-router';

import NotFound from '@/containers/NotFound/index.vue';
import Clock from '@/containers/Clock/index.vue';
import ColorPicker from '@/containers/ColorPicker/index.vue';
import Cropper from '@/containers/Cropper';
import InfiniteScroll from '@/containers/InfiniteScroll/index.vue';
import Snake from '@/containers/Snake/index.vue';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/ife' : '/',
  routes: [
    {
      path: '/',
      redirect: '/clock'
    },
    {
      path: '/clock',
      name: 'Clock',
      component: Clock
    },
    {
      path: '/color-picker',
      name: 'ColorPicker',
      component: ColorPicker
    },
    {
      path: '/cropper',
      name: 'Cropper',
      component: Cropper
    },
    {
      path: '/infinite-scroll',
      name: 'InfiniteScroll',
      component: InfiniteScroll
    },
    {
      path: '/snake',
      name: 'Snake',
      component: Snake
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
});
