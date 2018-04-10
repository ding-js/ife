interface E {
  x: number;
  y: number;
  isStart: boolean;
}

type EventCb = (e: E) => void;

interface Instance {
  move;
  start;
  end;
  bind;
  unbind;
}

const eventsMap = new Map<number, Instance>();

let uid = 0;

const getCoordinateByEvent = (
  element: HTMLElement,
  e: MouseEvent | TouchEvent
) => {
  if ((e as TouchEvent).touches) {
    const rect = element.getBoundingClientRect();
    const touch = (e as TouchEvent).touches[0];

    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  } else {
    return {
      x: (e as MouseEvent).offsetX,
      y: (e as MouseEvent).offsetY
    };
  }
};

export const bind = (element: HTMLElement, cb: EventCb) => {
  const instance = {
    move: (e: MouseEvent | TouchEvent) => {
      if (e.target !== element) {
        return;
      }

      cb({
        isStart: false,
        ...getCoordinateByEvent(element, e)
      });
    },
    start: (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      if (e.target !== element) {
        return;
      }

      cb({
        isStart: true,
        ...getCoordinateByEvent(element, e)
      });

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
