import Vue from 'vue';
import Router from 'vue-router';

import NotFound from '@/containers/NotFound';
import Clock from '@/containers/Clock';
import ColorPicker from '@/containers/ColorPicker';
import Cropper from '@/containers/Cropper';
import InfiniteScroll from '@/containers/InfiniteScroll';
import Snake from '@/containers/Snake';

Vue.use(Router);

const transformCase = (text: string): string => {
  return (
    text.charAt(0).toLowerCase() +
    text.slice(1).replace(/[A-Z]/g, match => {
      return '-' + match.toLowerCase();
    })
  );
};

export const components = [
  {
    name: 'Clock',
    component: Clock
  },
  {
    name: 'ColorPicker',
    component: ColorPicker
  },
  {
    name: 'Cropper',
    component: Cropper
  },
  {
    name: 'InfiniteScroll',
    component: InfiniteScroll
  },
  {
    name: 'Snake',
    component: Snake
  }
];

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: {
        name: 'Clock'
      }
    },
    ...components.map(v => ({
      path: '/' + transformCase(v.name),
      ...v
    })),
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
});
