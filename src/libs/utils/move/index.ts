type EventCb = (e: { x: number; y: number }) => void;

interface Instance {
  move;
  start;
  end;
  bind;
  unbind;
}

const eventsMap = new Map<number, Instance>();

let uid = 0;

export const bind = (element: HTMLElement, cb: EventCb) => {
  const instance = {
    move: (e: MouseEvent | TouchEvent) => {
      const { target } = e;
      if (element === target) {
        const result: any = {};

        if ((e as TouchEvent).touches) {
          const rect = element.getBoundingClientRect();
          const touch = (e as TouchEvent).touches[0];

          Object.assign(result, {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          });
        } else {
          Object.assign(result, {
            x: (e as MouseEvent).offsetX,
            y: (e as MouseEvent).offsetY
          });
        }

        cb(result);
      }
    },
    start: e => {
      e.preventDefault();
      document.addEventListener('mousemove', instance.move);
      document.addEventListener('touchmove', instance.move);
    },
    end: () => {
      document.removeEventListener('mousemove', instance.move);
      document.removeEventListener('touchmove', instance.move);
    },
    bind: () => {
      element.addEventListener('mousedown', instance.start);
      element.addEventListener('touchstart', instance.start);

      document.addEventListener('mouseup', instance.end);
      document.addEventListener('touchend', instance.end);
    },
    unbind: () => {
      instance.end();

      element.removeEventListener('mousedown', instance.start);
      element.removeEventListener('touchstart', instance.start);

      document.removeEventListener('mouseup', instance.end);
      document.removeEventListener('touchend', instance.end);
    }
  };

  instance.bind();

  uid++;

  eventsMap.set(uid, instance);

  return uid;
};

export const unbind = (id: number) => {
  const instance = eventsMap.get(id);

  if (!instance) {
    return;
  }

  instance.unbind();

  eventsMap.delete(id);
};
