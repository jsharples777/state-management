import debug from 'debug';
import moment from "moment";
import {SocketManager} from "./SocketManager";

import {ChatLog, Invitation, InviteType, JoinLeft, Message, MessageReceived, Priority, SimpleAttachment} from "./Types";
import {ChatEmitter} from "./ChatEmitter";
import {ChatReceiver} from "./ChatReceiver";
import {ChatEventListener} from "./ChatEventListener";

import {StateManager} from "../state/interface/StateManager";
import {BrowserStorageStateManager} from "../state/implementation/BrowserStorageStateManager";
import {ChatUserEventListener} from "./ChatUserEventListener";
import {UnreadMessageCountListener} from "./UnreadMessageCountListener";
import {isSameRoom} from "../util/EqualityFunctions";
import {v4} from "uuid";


enum UserStatus {
    LoggedOut,
    LoggedIn
}

const cmLogger = debug('chat-manager');

export class ChatManager implements ChatReceiver, ChatEmitter {
    private static _instance: ChatManager;
    private static chatLogKey = 'chat-logs';
    private static blockedListKey = 'blocked-list';
    private static favouriteListKey = 'favourite-list';
    protected chatLogs: ChatLog[];
    protected localStorage: StateManager;
    protected blockedList: string[] = [];
    protected favouriteList: string[] = [];
    protected loggedInUsers: string[] = [];
    protected chatListeners: ChatEventListener[];
    protected chatUserListeners: ChatUserEventListener[];
    private currentUsername = '';
    private unreadListener: UnreadMessageCountListener | null = null;

    private constructor() {
        cmLogger('Setting up chat logs, blocked list, and favourites');

        this.chatLogs = [];
        this.chatListeners = [];
        this.chatUserListeners = [];
        this.localStorage = new BrowserStorageStateManager(true, true, isSameRoom);

        // connect to the socket manager
        SocketManager.getInstance().addChatReceiver(this);

        // bind the receiver methods
        this.receiveLogin = this.receiveLogin.bind(this);
        this.receiveLogout = this.receiveLogout.bind(this);
        this.receiveInvitation = this.receiveInvitation.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.receiveMessageReceived = this.receiveMessageReceived.bind(this);
        this.receiveQueuedMessages = this.receiveQueuedMessages.bind(this);
        this.receiveQueuedInvites = this.receiveQueuedInvites.bind(this);
        this.receiveJoinedRoom = this.receiveJoinedRoom.bind(this);
        this.receivedLeftRoom = this.receivedLeftRoom.bind(this);
    }

    public static getInstance(): ChatManager {
        if (!(ChatManager._instance)) {
            ChatManager._instance = new ChatManager();
        }
        return ChatManager._instance;
    }

    public addChatEventHandler(receiver: ChatEventListener): void {
        this.chatListeners.push(receiver);
    }

    public addChatUserEventHandler(receiver: ChatUserEventListener): void {
        this.chatUserListeners.push(receiver);
    }

    public isUserLoggedIn(username: string) {
        return (this.loggedInUsers.findIndex((name) => name === username) >= 0);
    }

    receiveUserList(users: string[]): void {
        this.loggedInUsers = users;
        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(users));
    }

    public addUserToBlockedList(username: string): void {
        let index = this.blockedList.findIndex((blocked) => blocked === username);
        if (index < 0) {
            this.blockedList.push(username);
            this.saveBlockedList();
            this.chatUserListeners.forEach((listener) => listener.handleBlockedUsersChanged(this.favouriteList));
        }
    }

    public removeUserFromBlockedList(username: string): void {
        let index = this.blockedList.findIndex((blocked) => blocked === username);
        if (index >= 0) {
            this.blockedList.splice(index, 1);
            this.saveBlockedList();
            this.chatUserListeners.forEach((listener) => listener.handleBlockedUsersChanged(this.favouriteList));
        }

    }

    public isUserInBlockedList(username: string): boolean {
        return (this.blockedList.findIndex((blocked) => blocked === username) >= 0);
    }

    public addUserToFavouriteList(username: string): void {
        let index = this.favouriteList.findIndex((favourite) => favourite === username);
        if (index < 0) {
            this.favouriteList.push(username);
            this.saveFavouriteList();
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUsersChanged(this.favouriteList));
        }
    }

    public removeUserFromFavouriteList(username: string): void {
        let index = this.favouriteList.findIndex((blocked) => blocked === username);
        if (index >= 0) {
            this.favouriteList.splice(index, 1);
            this.saveFavouriteList();
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUsersChanged(this.favouriteList));
        }

    }

    public isUserInFavouriteList(username: string): boolean {
        return (this.favouriteList.findIndex((user) => user === username) >= 0);
    }

    public getFavouriteUserList(): string[] {
        return [...this.favouriteList];
    }

    public getBlockedUserList(): string[] {
        return [...this.blockedList];
    }

    public setCurrentUser(username: string): void {
        cmLogger(`Setting current user ${username}`);
        this.currentUsername = username;
        // load previous logs
        let savedLogs = this.localStorage.getStateByName(ChatManager.chatLogKey + this.currentUsername);
        cmLogger(savedLogs);
        if (savedLogs) {
            this.chatLogs = savedLogs;
        }

        // load previous blocked list
        let blockedList = this.localStorage.getStateByName(ChatManager.blockedListKey + this.currentUsername);
        cmLogger(blockedList);
        if (blockedList) {
            this.blockedList = blockedList;
        }

        // load previous favourite list
        let favouriteList = this.localStorage.getStateByName(ChatManager.favouriteListKey + this.currentUsername);
        cmLogger(favouriteList);
        if (favouriteList) {
            this.favouriteList = favouriteList;
        }

        this.chatListeners.forEach((listener) => listener.handleChatLogsUpdated());


    }

    public getCurrentUser(): string {
        return this.currentUsername;
    }

    receiveJoinedRoom(users: JoinLeft): void {
        // we get this for all changes to a room, if the username is us can safely ignore
        //if (users.username === this.currentUsername) return;
        if (users.type !== InviteType.ChatRoom) return;

        let log: ChatLog = this.ensureChatLogExists(users.room);

        cmLogger(`User list for room ${users.room} - ${users.userList.join(',')}`);
        log.users = users.userList;
        // add a "message" for joined user
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        const joinDateTime = moment().format('DD/MM/YYYY HH:mm');
        let message: Message = {
            id:v4(),
            from: '',
            created: created,
            room: users.room,
            priority: Priority.Normal,
            type: InviteType.ChatRoom,
            message: `${users.username} joined the chat on ${joinDateTime}`,
            received: true
        }
        log.messages.push(message);
        this.saveLogs();

        this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(log, false));
    }

    receivedLeftRoom(users: JoinLeft): void {
        // we get this for all changes to a room, if the username is us can safely ignore
        if (users.type !== InviteType.ChatRoom) return;
        if (users.username === this.currentUsername) return;

        let log: ChatLog = this.ensureChatLogExists(users.room);

        cmLogger(`User list for room ${users.room} - ${users.userList.join(',')}`);
        log.users = users.userList;
        // add a "message" for leaving user
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        const joinDateTime = moment().format('DD/MM/YYYY HH:mm');
        let message: Message = {
            id:v4(),
            from: '',
            created: created,
            room: users.room,
            priority: Priority.Normal,
            type: InviteType.ChatRoom,
            message: `${users.username} left the chat on ${joinDateTime}`,
            received:true,
        }
        log.messages.push(message);
        this.saveLogs();

        this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(log, false));
    }

    receiveInvitation(invite: Invitation): void {
        if (invite.type !== InviteType.ChatRoom) return;

        //  unless we are receiving an invite from someone in our blocked list, we automatically accept this invite
        if (!this.isUserInBlockedList(invite.from)) {
            cmLogger(`Invited to chat ${invite.room}`);
            const didChatAlreadyExist = this.doesChatRoomExist(invite.room);
            cmLogger(invite);
            cmLogger(`Letting the listeners know, if they are all happy to accept then we will join the room`);

            let happyToProceed = true;

            if (!didChatAlreadyExist) {
                this.chatListeners.forEach((listener) => {
                    if (!listener.handleNewInviteReceived(invite)) {
                        happyToProceed = false;
                    }
                });
            }
            if (happyToProceed) {

                let chatLog: ChatLog = this.ensureChatLogExists(invite.room);
                // keep a record of the type of invite
                chatLog.type = invite.type;

                // add the users in the invitation user list for the room, if not already added
                if (invite.userList) {
                    invite.userList.forEach((username: string) => {
                        if ((chatLog.users.findIndex((user) => user === username)) < 0) chatLog.users.push(invite.from);
                    });
                }

                if ((chatLog.users.findIndex((user) => user === invite.from)) < 0) chatLog.users.push(invite.from);

                this.saveLogs();
                cmLogger(`Joining chat ${invite.room}`);
                SocketManager.getInstance().joinChat(this.getCurrentUser(), invite.room, InviteType.ChatRoom);
                this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, false));
            }

        } else {
            cmLogger(`User ${invite.from} blocked`);
        }
    }

    receiveLogin(username: string): void {
        cmLogger(`Handle login received for ${username}`);
        // keep track of the logged in users
        let index = this.loggedInUsers.findIndex((user) => user === username);
        if (index < 0) this.loggedInUsers.push(username);
        cmLogger(this.loggedInUsers);

        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(this.loggedInUsers));

        // if the user in in favourites and not in blocked list passing this on to the listener
        if (!this.isUserInBlockedList(username) && this.isUserInFavouriteList(username)) {
            cmLogger(`User ${username} logging in`);
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedIn(username));
        }
    }

    receiveLogout(username: string): void {
        let index = this.loggedInUsers.findIndex((user) => user === username);
        if (index >= 0) this.loggedInUsers.splice(index, 1);

        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(this.loggedInUsers));

        // if the user in in favourites and not in blocked list passing this on to the listener
        if (!this.isUserInBlockedList(username) && this.isUserInFavouriteList(username)) {
            cmLogger(`User ${username} logging out`);
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedOut(username));
        }
    }

    receiveDecline(room: string, username: string, type: number): void {
        if (type !== InviteType.ChatRoom) return;
        // we get this for all changes to a room, if the username is us can safely ignore
        if (username === this.currentUsername) return;


        if (!this.isUserInBlockedList(username)) {
            cmLogger(`User ${username} declined invitation to room`);
            this.chatListeners.forEach((listener) => listener.handleInvitationDeclined(room, username));
        }

    }

    public setUnreadCountListener(listener: UnreadMessageCountListener) {
        this.unreadListener = listener;
    }

    public touchChatLog(room: string): void {
        let chatLog = this.ensureChatLogExists(room);
        chatLog.unreadMessages = 0;
        chatLog.unreadHighMessages = 0;
        chatLog.unreadUrgentMessages = 0;
        chatLog.lastViewed = parseInt(moment().format('YYYYMMDDHHmmss'));

        this.emitUnreadMessageCountChanged();

        this.saveLogs();
    }

    public getChatLog(room: string): ChatLog | null {
        let log: ChatLog | null = null;
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        if (index >= 0) log = this.chatLogs[index];
        return log;
    }

    receiveMessage(message: Message, wasOffline: boolean = false): void {
        if (message.type !== InviteType.ChatRoom) return; // ignore messages that aren't for chat rooms
        // double check the message is not from us somehow
        if (message.from === this.getCurrentUser()) return;
        // don't receive messages from the blocked users
        if (!this.isUserInBlockedList(message.from)) {

            // ok, so we need to add the message to the chat log, increase the new message count, save the logs and pass it on
            let chatLog = this.ensureChatLogExists(message.room);
            this.addSenderToRoomIfNotAlreadyPresent(chatLog, message.from);
            this.addMessageToChatLog(chatLog, message);
            cmLogger(`Message received`);
            cmLogger(message);
            // sending message acknowledgement
            SocketManager.getInstance().sendMessageReceived(message.id, this.getCurrentUser(),message.room);

            this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, wasOffline));
        } else {
            cmLogger(`Message received from user ${message.from} - is in blocked list, not passed on.`)
        }

    }

    receiveQueuedInvites(invites: any): void {
        // just loop through and process each invite
        invites.forEach((invite: Invitation) => {
            this.receiveInvitation(invite);
        });
    }

    receiveQueuedMessages(messages: any): void {
        // just loop through a process each message
        messages.forEach((message: Message) => {
            this.receiveMessage(message, true)
        });
        this.chatListeners.forEach((listener) => listener.handleOfflineMessagesReceived(messages));
    }

    joinChat(room: string): void {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        this.ensureChatLogExists(room);
        SocketManager.getInstance().joinChat(this.getCurrentUser(), room, InviteType.ChatRoom);
    }

    leaveChat(room: string): void {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        this.removeChatLog(room);
        SocketManager.getInstance().leaveChat(this.getCurrentUser(), room, InviteType.ChatRoom);
        this.emitUnreadMessageCountChanged();
    }

    login(): void {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        SocketManager.getInstance().login(this.getCurrentUser());
        // get the current user list
        SocketManager.getInstance().getUserList();
        // connect to the chat rooms already in logs
        this.chatLogs.forEach((log) => {
            if (log.type === InviteType.ChatRoom) {
                SocketManager.getInstance().joinChat(this.currentUsername, log.roomName, InviteType.ChatRoom);
            }
        });
    }

    logout(): void {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        SocketManager.getInstance().logout(this.getCurrentUser());
    }

    declineInvite(room: string) {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        SocketManager.getInstance().sendDeclineInvite(room, this.getCurrentUser(), InviteType.ChatRoom);

    }

    sendInvite(to: string, room: string, type: InviteType = InviteType.ChatRoom, requiresAcceptDecline: boolean = false, subject: string = ''): void {
        if (this.getCurrentUser().trim().length === 0) return;  // we are not logged in
        // can't accidentally send an invite to blacklisted
        if (this.isUserInBlockedList(to)) return;
        // only send an invite if the user isn't already in the room
        const log: ChatLog = this.ensureChatLogExists(room);
        if (log.users.findIndex((user) => user === to) < 0) {
            SocketManager.getInstance().sendInvite(this.getCurrentUser(), to, room, type, requiresAcceptDecline, subject);
        }
    }

    sendMessage(room: string, content: string, priority: Priority = Priority.Normal, simpleAttachement: SimpleAttachment | undefined, attachment: any | undefined): Message | null {
        if (this.getCurrentUser().trim().length === 0) return null;  // we are not logged in
        let log = this.ensureChatLogExists(room);
        // send the message
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        if (!(simpleAttachement)) simpleAttachement = {
            identifier: '',
            type: '',
            displayText: ''
        }
        const id = v4();
        SocketManager.getInstance().sendMessage(id, this.getCurrentUser(), room, content, created, InviteType.ChatRoom, priority, simpleAttachement, {});

        // add the message to the chat log
        if (!attachment) attachment = {};
        let sent: Message = {
            id:id,
            from: this.getCurrentUser(),
            room: room,
            message: content,
            created: created,
            priority: priority,
            type: InviteType.ChatRoom,
            simpleAttachment: simpleAttachement,
            attachment: attachment,
            received:false
        }
        this.addMessageToChatLog(log, sent);
        return sent;
    }

    public getChatLogs(): ChatLog[] {
        return [...this.chatLogs];
    }

    public startChatWithUser(username: string): string | null {
        let roomName: string | null = null;
        if (username) {
            if (this.doesChatAlreadyExistWithUser(username)) {
                cmLogger(`Already started chat with ${username}`);
                const existingChatLog = this.getExistingChatLogWithUser(username);
                // ok, lets connect to the server
                if (existingChatLog) {
                    SocketManager.getInstance().joinChat(this.getCurrentUser(), existingChatLog.roomName, InviteType.ChatRoom);
                    roomName = existingChatLog.roomName;
                }
            } else {

                cmLogger(`Starting chat with ${username}`);
                // first thing, do we have a chat log with this user (and just this user) already?
                let chatLog: ChatLog = this.ensureChatLogExistsWithUser(username);
                this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, false));


                // invite the other user
                SocketManager.getInstance().sendInvite(this.getCurrentUser(), username, chatLog.roomName, InviteType.ChatRoom, false, '');
                // ok, lets connect to the server
                SocketManager.getInstance().joinChat(this.getCurrentUser(), chatLog.roomName, InviteType.ChatRoom);
                roomName = chatLog.roomName;
            }
        }
        return roomName;
    }

    public doesChatAlreadyExistWithUser(username: string): boolean {
        let foundLog = false;
        let index = 0;
        while (index < this.chatLogs.length) {
            let log = this.chatLogs[index];
            if (log.users.length === 2) {
                // is the username in the two of this room?
                if (log.users.findIndex((value) => value === username) >= 0) {
                    foundLog = true;
                    index = this.chatLogs.length;
                }
            }
            index++;
        }
        return foundLog;
    }

    public clearAllChatLogs() {
        this.chatLogs = [];
        this.saveLogs();
    }

    public clearAllUserLists() {
        this.blockedList = [];
        this.saveBlockedList();
        this.favouriteList = [];
        this.saveFavouriteList();
    }

    public reset() {
        this.clearAllChatLogs();
        this.clearAllUserLists();
    }

    private saveLogs(): void {
        this.localStorage.setStateByName(ChatManager.chatLogKey + this.currentUsername, this.chatLogs, false);
    }

    private saveBlockedList(): void {
        this.localStorage.setStateByName(ChatManager.blockedListKey + this.currentUsername, this.blockedList, false);
    }

    private saveFavouriteList(): void {
        this.localStorage.setStateByName(ChatManager.favouriteListKey + this.currentUsername, this.favouriteList, false);
    }

    private ensureChatLogExists(room: string): ChatLog {
        let log: ChatLog;
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        if (index < 0) {
            log = {
                roomName: room,
                users: [this.getCurrentUser()],
                messages: [],
                lastViewed: parseInt(moment().format('YYYYMMDDHHmmss')),
                unreadMessages: 0,
                unreadHighMessages: 0,
                unreadUrgentMessages: 0,
                type: InviteType.ChatRoom,
            }
            this.chatLogs.push(log);
            this.saveLogs();
        } else {
            log = this.chatLogs[index];
        }
        return log;
    }

    private getExistingChatLogWithUser(username: string): ChatLog | null {
        let result: ChatLog | null = null;
        let foundLog = false;
        let index = 0;
        while (index < this.chatLogs.length) {
            let log = this.chatLogs[index];
            if (log.users.length === 2) {
                // is the username in the two of this room?
                if (log.users.findIndex((value) => value === username) >= 0) {
                    foundLog = true;
                    result = log;
                    index = this.chatLogs.length;
                }
            }
            index++;
        }
        return result;
    }

    private computeRoomName(username:string):string {
        const currentUser = this.getCurrentUser().split(' ').join('').toLowerCase();
        const toUser = username.split(' ').join('').toLowerCase();
        let roomName = `${currentUser}-${toUser}`;
        if (toUser < currentUser) {
            roomName = `${toUser}-${currentUser}`;
        }
        return roomName;
    }

    private ensureChatLogExistsWithUser(username: string): ChatLog {
        let foundLog: ChatLog | null = null;
        foundLog = this.getExistingChatLogWithUser(username);
        if (!foundLog) {
            foundLog = {
                roomName: this.computeRoomName(username),
                users: [this.getCurrentUser(), username],
                messages: [],
                lastViewed: parseInt(moment().format('YYYYMMDDHHmmss')),
                unreadMessages: 0,
                unreadHighMessages: 0,
                unreadUrgentMessages: 0,
                type: InviteType.ChatRoom
            }
            this.chatLogs.push(foundLog);
            this.saveLogs();
        }
        return foundLog;
    }


    private doesChatRoomExist(room: string) {
        let index = this.chatLogs.findIndex((log: ChatLog) => log.roomName === room);
        return (index >= 0);
    }

    private emitUnreadMessageCountChanged() {
        let unreadNormalMessages = 0;
        let unreadHighMessages = 0;
        let unreadUrgentMessages = 0;
        this.chatLogs.forEach((log) => {
            unreadNormalMessages += log.unreadMessages;
            unreadHighMessages += log.unreadHighMessages;
            unreadUrgentMessages += log.unreadUrgentMessages;
        });
        this.unreadListener?.countChanged(unreadNormalMessages, unreadHighMessages, unreadUrgentMessages);
    }

    private addMessageToChatLog(log: ChatLog, message: Message) {
        switch (message.priority) {
            case Priority.Normal: {
                log.unreadMessages++;
                break;
            }
            case Priority.High: {
                log.unreadHighMessages++;
                break;
            }
            case Priority.Urgent: {
                log.unreadUrgentMessages++;
                break;
            }
        }
        log.messages.push(message);

        this.emitUnreadMessageCountChanged();

        if (message.from === this.getCurrentUser()) {
            this.touchChatLog(log.roomName); // this will also save the logs
        } else {
            this.saveLogs();
        }
    }

    private messageReceivedInChatLog(log: ChatLog, ack: MessageReceived) {
        // update the message in the chat log to say is received
        const foundIndex = log.messages.findIndex((message) => message.id === ack.id);
        if (foundIndex >= 0) {
            const message = log.messages[foundIndex];
            message.received = true;
        }

        if (ack.receivedBy === this.getCurrentUser()) {
            this.touchChatLog(log.roomName); // this will also save the logs
        } else {
            this.saveLogs();
        }
    }

    private addSenderToRoomIfNotAlreadyPresent(chatLog: ChatLog, sender: string) {
        let index = chatLog.users.findIndex((user) => user === sender);
        if (index < 0) {
            chatLog.users.push(sender);
        }
    }

    private removeChatLog(room: string) {
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        if (index >= 0) {
            cmLogger(`Removing Chat log for room ${room}`);
            let result = this.chatLogs.splice(index, 1);
            cmLogger(result.length);
            this.saveLogs();
        }
    }

    receiveMessageReceived(message: MessageReceived): void {
        if (message.receivedBy === this.getCurrentUser()) return;
        // don't receive messages from the blocked users
        if (!this.isUserInBlockedList(message.receivedBy)) {
            let chatLog = this.ensureChatLogExists(message.room);
            this.messageReceivedInChatLog(chatLog, message);
            cmLogger(`Message ack received`);
            cmLogger(message);
            this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, false));
        } else {
            cmLogger(`Message ack received from user ${message.receivedBy} - is in blocked list, not passed on.`)
        }

    }

}
