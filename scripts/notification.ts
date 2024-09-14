import { $ } from './utils';

export class NotificationContainer {
  private container: HTMLElement;
  private template: HTMLTemplateElement;

  constructor(containerEl: HTMLElement) {
    this.container = containerEl;
    this.template = $('#notification-template');
  }

  addNotification() {
    const fragment = document.importNode(this.template.content, true);
    const notification = fragment.querySelector('div')!;
    notification.classList.add('show');
    this.container.appendChild(notification);

    notification.addEventListener('animationend', () =>
      this.container.removeChild(notification),
    );
  }
}
