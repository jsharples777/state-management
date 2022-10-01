import { Notification } from './Notification';
import { NotificationManager } from "./NotificationManager";
import { NotificationType } from "./NotificationTypes";
export class BootstrapNotification extends Notification {
    constructor(notificationManager) {
        super(notificationManager);
    }
    // Make the notification visible on the screen
    show(content, topOffset = 0) {
        let containerId = this.notificationManager.getContainerId();
        // convert the context to a background colour
        let bgColorClass = '';
        switch (content.type) {
            case NotificationType.info: {
                bgColorClass = 'bg-info';
                break;
            }
            case NotificationType.warning: {
                bgColorClass = 'bg-warning';
                break;
            }
            case NotificationType.message: {
                bgColorClass = 'bg-primary';
                break;
            }
            case NotificationType.priority: {
                bgColorClass = 'bg-danger';
                break;
            }
            default: {
                bgColorClass = "bg-info";
            }
        }
        // Creating the notification container div
        const containerNode = document.createElement('div');
        containerNode.className = 'notification toast';
        containerNode.style.top = `${topOffset}px`;
        containerNode.setAttribute("role", "alert");
        containerNode.setAttribute("data-autohide", "false");
        // Adding the notification title node
        const titleNode = document.createElement('div');
        titleNode.className = `toast-header text-white ${bgColorClass}`;
        const titleTextNode = document.createElement('strong');
        titleTextNode.className = "mr-auto";
        titleTextNode.textContent = content.title;
        // Adding a little button on the notification
        const closeButtonNode = document.createElement('button');
        closeButtonNode.className = 'ml-2 mb-1 close';
        closeButtonNode.textContent = 'x';
        closeButtonNode.addEventListener('click', () => {
            this.notificationManager.close(content);
        });
        // Adding the notification message content node
        const messageNode = document.createElement('div');
        messageNode.className = 'toast-body';
        messageNode.innerHTML = content.message;
        messageNode.addEventListener('click', (event) => {
            NotificationManager.getInstance().contentClicked(content);
        });
        // Appending the container with all the elements newly created
        titleNode.appendChild(titleTextNode);
        titleNode.appendChild(closeButtonNode);
        containerNode.appendChild(titleNode);
        containerNode.appendChild(messageNode);
        containerNode.classList.add(`is-${content.type}`);
        // add the attachment if any
        if (content.attachment) {
            const renderer = NotificationManager.getInstance().getAttachmentRenderer();
            if (renderer) {
                const attachmentNode = renderer.renderAttachment(containerNode, content.attachment);
                if (attachmentNode) {
                    attachmentNode.addEventListener('click', (event) => {
                        NotificationManager.getInstance().attachmentClicked(content);
                    });
                }
            }
        }
        // Inserting the notification to the page body
        const containerEl = document.getElementById(containerId);
        if (containerEl)
            containerEl.appendChild(containerNode);
        // activate it
        // @ts-ignore
        $(".notification").toast('show');
        // Default duration delay
        if (content.duration > 0) {
            setTimeout(() => {
                this.notificationManager.hide(content);
            }, content.duration);
        }
        return containerNode;
    }
}
//# sourceMappingURL=BootstrapNotification.js.map