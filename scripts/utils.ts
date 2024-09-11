export const $ = <T extends Element = HTMLElement>(selector: string): T =>
  document.querySelector(selector)!;
export const $$ = <T extends Element = HTMLElement>(
  selector: string,
): NodeListOf<T> => document.querySelectorAll(selector);

export const isTouchEvent = (ev: Event): ev is TouchEvent =>
  ev.type.toLowerCase().startsWith('touch');

export const getRandomColor = () => {
  // No puede ser en hsl porque uso este valor para
  // reflejar el cambio también en el input type="color"
  // y solo acepta values que sean hexadecimales.
  const randomInt = Math.floor(Math.random() * 0xffffff);
  const hexString = randomInt.toString(16).padStart(6, '0');
  return `#${hexString}`;
};
