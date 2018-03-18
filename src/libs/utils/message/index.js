import Vue from 'vue';
import './index.scss';

const emptyCb = () => {};

const Message = {
  data() {
    return {
      message: '',
      title: '',
      cb: null,
      visible: false
    };
  },

  render() {
    const cb = this.cb || emptyCb;

    return (
      <div class="message" v-show={this.visible}>
        <header class="message__header">{this.title}</header>
        <div class="message__content">{this.message}</div>
        <footer class="message__footer">
          <button type="button" onClick={cb}>
            确定
          </button>
        </footer>
      </div>
    );
  }
};

const MessageConstructor = Vue.extend(Message);

export default (options, container = document.body) => {
  const vm = new MessageConstructor({
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
