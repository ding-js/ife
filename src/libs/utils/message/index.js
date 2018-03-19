import Vue from 'vue';
import './index.scss';

const Message = Vue.extend({
  data() {
    return {
      message: '',
      title: '',
      cb: null,
      visible: false
    };
  },

  render() {
    const cb = this.cb;
    const listeners = cb ? { click: cb } : {};

    return (
      <transition name="fade" onAfter-leave={this.doDestroy}>
        <div class="message__wrapper" v-show={this.visible}>
          <div class="message__mask" />
          <div class="message">
            <header class="message__header">{this.title}</header>
            <div class="message__content">{this.message}</div>
            <footer class="message__footer">
              <button type="button" {...{ on: listeners }}>
                确定
              </button>
            </footer>
          </div>
        </div>
      </transition>
    );
  },
  methods: {
    doDestroy() {
      this.$destroy();

      this.$el.parentNode.removeChild(this.$el);
    }
  }
});

export default (options, container = document.body) => {
  const vm = new Message({
    data() {
      return {
        ...options,
        cb() {
          if (options.cb) {
            options.cb();
          }

          vm.visible = false;
        }
      };
    }
  });

  vm.$mount();

  container.appendChild(vm.$el);

  vm.visible = true;
};
