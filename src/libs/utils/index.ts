import toast from './toast';

const t = toast({
  delay: 5000
});

export { t as toast };

export const debounce = (func, wait: number) => {
  let timer = null;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

export function isNumber(num: any) {
  return typeof num === 'number';
}
