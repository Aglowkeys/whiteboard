import { $ } from './utils';

const toolbar = $('#toolbar');
const overlay = $('#confirm-overlay');
const dialog = $('#confirm');
const [confirmButton, cancelButton] = dialog.querySelectorAll('button');
const [confirmTopTrap, confirmBottomTrap] = dialog.querySelectorAll('[id^=confirm-focus-trap]');
const btnClear = $('#btn-clear');

export class ConfirmDialog {
  private onConfirm: () => void;
  private onCancel: () => void;
  private listeners: {
    confirmAction: (ev: MouseEvent) => void;
    hideOnClick: (ev: MouseEvent) => void;
    hideOnEsc: (ev: KeyboardEvent) => void;
    manageFocus: (ev: Event) => void;
  };

  constructor(onConfirm: () => void, onCancel: () => void) {
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.listeners = {
      confirmAction: () => {
        this.onConfirm();
        this.hide();
      },
      hideOnClick: (ev: MouseEvent) => {
        if (ev.target === overlay || ev.target === cancelButton) {
          this.hide();
          this.onCancel();
        }
      },
      hideOnEsc: (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') {
          this.hide();
          this.onCancel();
        }
      },
      manageFocus: (ev: Event) => {
        if (ev.target === confirmTopTrap) {
          cancelButton.focus();
        } else if (ev.target === confirmBottomTrap) {
          confirmButton.focus();
        }
      },
    };
  }

  show() {
    toolbar.setAttribute('inert', 'true');
    overlay.classList.add('visible');
    dialog.classList.add('visible');
    confirmButton.focus();

    confirmTopTrap.addEventListener('focus', this.listeners.manageFocus);
    confirmBottomTrap.addEventListener('focus', this.listeners.manageFocus);
    overlay.addEventListener('keydown', this.listeners.hideOnEsc);
    confirmButton.addEventListener('click', this.listeners.confirmAction);
    cancelButton.addEventListener('click', this.listeners.hideOnClick);
    overlay.addEventListener('click', this.listeners.hideOnClick);
  }

  hide() {
    toolbar.removeAttribute('inert');
    overlay.classList.add('hiding');
    dialog.classList.remove('visible');

    overlay.addEventListener(
      'animationend',
      () => {
        overlay.classList.remove('visible', 'hiding');
      },
      { once: true },
    );

    confirmTopTrap.removeEventListener('focus', this.listeners.manageFocus);
    confirmBottomTrap.removeEventListener('focus', this.listeners.manageFocus);
    overlay.removeEventListener('keydown', this.listeners.hideOnEsc);
    confirmButton.removeEventListener('click', this.listeners.confirmAction);
    cancelButton.removeEventListener('click', this.listeners.hideOnClick);
    overlay.removeEventListener('click', this.listeners.hideOnClick);

    // Restore focus to the button that opened the confirm dialog
    btnClear.focus();
  }
}
