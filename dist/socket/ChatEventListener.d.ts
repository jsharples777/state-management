import { ChatLog, Invitation, Message } from "./Types";
export interface ChatEventListener {
    handleChatLogUpdated(log: ChatLog, wasOffline: boolean): void;
    handleChatLogsUpdated(): void;
    handleChatStarted(log: ChatLog): void;
    handleOfflineMessagesReceived(messages: Message[]): void;
    handleNewInviteReceived(invite: Invitation): boolean;
    handleInvitationDeclined(room: string, username: string): void;
}
