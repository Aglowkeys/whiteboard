import { $ } from './utils';

const toolbar = $('#toolbar');
const overlay = $('#modal-overlay');
const dialog = $('#modal');
const btnClose = $('#btn-close');
const btnInfo = $('#btn-info');

const [topFocusTrap, bottomFocusTrap] = dialog.querySelectorAll('[id^=modal-focus-trap]');
const allFocusableElements = dialog.querySelectorAll<HTMLElement>('button, a');
const firstFocusableElement = allFocusableElements[0];
const lastFocusableElement = allFocusableElements[allFocusableElements.length - 1];

export class InfoDialog {
  private onClose: () => void;
  private listeners = {
    hideOnClick: ({ target }: MouseEvent) => {
      const isNode = target instanceof Node;
      if (isNode && (target === overlay || btnClose.contains(target))) {
        this.onClose();
        this.hide();
      }
    },
    hideOnEsc: ({ key }: KeyboardEvent) => {
      if (key === 'Escape') {
        this.onClose();
        this.hide();
      }
    },
    manageFocus: ({ target }: Event) => {
      if (target === topFocusTrap) {
        lastFocusableElement.focus();
      } else if (target === bottomFocusTrap) {
        firstFocusableElement.focus();
      }
    },
  };

  constructor(onClose: () => void) {
    this.onClose = onClose;
  }

  show() {
    toolbar.setAttribute('inert', 'true');
    overlay.classList.add('visible');
    firstFocusableElement.focus();

    topFocusTrap.addEventListener('focus', this.listeners.manageFocus);
    bottomFocusTrap.addEventListener('focus', this.listeners.manageFocus);
    window.addEventListener('keydown', this.listeners.hideOnEsc);
    overlay.addEventListener('click', this.listeners.hideOnClick);
    btnClose.addEventListener('click', this.listeners.hideOnClick);
  }

  hide() {
    toolbar.removeAttribute('inert');
    overlay.classList.add('hiding');

    overlay.addEventListener(
      'animationend',
      () => {
        overlay.classList.remove('visible', 'hiding');

        // Restore focus to the button that opened the info dialog
        btnInfo.focus();
      },
      { once: true },
    );

    topFocusTrap.removeEventListener('focus', this.listeners.manageFocus);
    bottomFocusTrap.removeEventListener('focus', this.listeners.manageFocus);
    window.removeEventListener('keydown', this.listeners.hideOnEsc);
    overlay.removeEventListener('click', this.listeners.hideOnClick);
    btnClose.removeEventListener('click', this.listeners.hideOnClick);
  }
}
