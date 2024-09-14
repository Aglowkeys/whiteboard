import { $ } from './utils';

const NOTIFICATION_END_EVENT_NAME = 'notificationend';

class Notification {
  notification: HTMLDivElement;

  constructor(template: HTMLTemplateElement) {
    this.notification = document
      .importNode(template.content, true)
      .querySelector('div')!;

    this.init();
  }

  private init() {
    this.notification.classList.add('show');
    this.notification.addEventListener('animationend', () => this.shrink(), {
      once: true,
    });
  }

  private shrink() {
    this.notification.classList.add('shrink');
    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.dispatchEvent(new Event(NOTIFICATION_END_EVENT_NAME));
      },
      { once: true },
    );
  }
}

export class NotificationContainer {
  private container: HTMLElement;
  private template: HTMLTemplateElement;

  constructor(containerEl: HTMLElement) {
    this.container = containerEl;
    this.template = $('#notification-template');
  }

  addNotification() {
    const notification = new Notification(this.template).notification;
    this.container.appendChild(notification);

    notification.addEventListener(NOTIFICATION_END_EVENT_NAME, () => {
      this.container.removeChild(notification);
    });
  }
}
