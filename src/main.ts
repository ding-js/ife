/* tslint:disable ordered-imports*/
import '@/styles/index.scss';
import Vue from 'vue';
import App from '@/containers/App';

import router from './router';

Vue.config.productionTip = false;

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  router,
  render(h) {
    return h(App);
  }
});

console.info(`version %c${process.env.VUE_APP_VERSION}`, 'color:#108ee9');
