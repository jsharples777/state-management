import debug from 'debug';
import moment from "moment";
import { SocketManager } from "./SocketManager";
import { InviteType, Priority } from "./Types";
import { BrowserStorageStateManager } from "../state/implementation/BrowserStorageStateManager";
import { isSameRoom } from "../util/EqualityFunctions";
import { v4 } from "uuid";
var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["LoggedOut"] = 0] = "LoggedOut";
    UserStatus[UserStatus["LoggedIn"] = 1] = "LoggedIn";
})(UserStatus || (UserStatus = {}));
const cmLogger = debug('chat-manager');
export class ChatManager {
    constructor() {
        this.blockedList = [];
        this.favouriteList = [];
        this.loggedInUsers = [];
        this.currentUsername = '';
        this.unreadListener = null;
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
    static getInstance() {
        if (!(ChatManager._instance)) {
            ChatManager._instance = new ChatManager();
        }
        return ChatManager._instance;
    }
    addChatEventHandler(receiver) {
        this.chatListeners.push(receiver);
    }
    addChatUserEventHandler(receiver) {
        this.chatUserListeners.push(receiver);
    }
    isUserLoggedIn(username) {
        return (this.loggedInUsers.findIndex((name) => name === username) >= 0);
    }
    receiveUserList(users) {
        this.loggedInUsers = users;
        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(users));
    }
    addUserToBlockedList(username) {
        let index = this.blockedList.findIndex((blocked) => blocked === username);
        if (index < 0) {
            this.blockedList.push(username);
            this.saveBlockedList();
            this.chatUserListeners.forEach((listener) => listener.handleBlockedUsersChanged(this.favouriteList));
        }
    }
    removeUserFromBlockedList(username) {
        let index = this.blockedList.findIndex((blocked) => blocked === username);
        if (index >= 0) {
            this.blockedList.splice(index, 1);
            this.saveBlockedList();
            this.chatUserListeners.forEach((listener) => listener.handleBlockedUsersChanged(this.favouriteList));
        }
    }
    isUserInBlockedList(username) {
        return (this.blockedList.findIndex((blocked) => blocked === username) >= 0);
    }
    addUserToFavouriteList(username) {
        let index = this.favouriteList.findIndex((favourite) => favourite === username);
        if (index < 0) {
            this.favouriteList.push(username);
            this.saveFavouriteList();
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUsersChanged(this.favouriteList));
        }
    }
    removeUserFromFavouriteList(username) {
        let index = this.favouriteList.findIndex((blocked) => blocked === username);
        if (index >= 0) {
            this.favouriteList.splice(index, 1);
            this.saveFavouriteList();
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUsersChanged(this.favouriteList));
        }
    }
    isUserInFavouriteList(username) {
        return (this.favouriteList.findIndex((user) => user === username) >= 0);
    }
    getFavouriteUserList() {
        return [...this.favouriteList];
    }
    getBlockedUserList() {
        return [...this.blockedList];
    }
    setCurrentUser(username) {
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
    getCurrentUser() {
        return this.currentUsername;
    }
    receiveJoinedRoom(users) {
        // we get this for all changes to a room, if the username is us can safely ignore
        //if (users.username === this.currentUsername) return;
        if (users.type !== InviteType.ChatRoom)
            return;
        let log = this.ensureChatLogExists(users.room);
        cmLogger(`User list for room ${users.room} - ${users.userList.join(',')}`);
        log.users = users.userList;
        // add a "message" for joined user
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        const joinDateTime = moment().format('DD/MM/YYYY HH:mm');
        let message = {
            id: v4(),
            from: '',
            created: created,
            room: users.room,
            priority: Priority.Normal,
            type: InviteType.ChatRoom,
            message: `${users.username} joined the chat on ${joinDateTime}`,
            received: true
        };
        log.messages.push(message);
        this.saveLogs();
        this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(log, false));
    }
    receivedLeftRoom(users) {
        // we get this for all changes to a room, if the username is us can safely ignore
        if (users.type !== InviteType.ChatRoom)
            return;
        if (users.username === this.currentUsername)
            return;
        let log = this.ensureChatLogExists(users.room);
        cmLogger(`User list for room ${users.room} - ${users.userList.join(',')}`);
        log.users = users.userList;
        // add a "message" for leaving user
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        const joinDateTime = moment().format('DD/MM/YYYY HH:mm');
        let message = {
            id: v4(),
            from: '',
            created: created,
            room: users.room,
            priority: Priority.Normal,
            type: InviteType.ChatRoom,
            message: `${users.username} left the chat on ${joinDateTime}`,
            received: true,
        };
        log.messages.push(message);
        this.saveLogs();
        this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(log, false));
    }
    receiveInvitation(invite) {
        if (invite.type !== InviteType.ChatRoom)
            return;
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
                let chatLog = this.ensureChatLogExists(invite.room);
                // keep a record of the type of invite
                chatLog.type = invite.type;
                // add the users in the invitation user list for the room, if not already added
                if (invite.userList) {
                    invite.userList.forEach((username) => {
                        if ((chatLog.users.findIndex((user) => user === username)) < 0)
                            chatLog.users.push(invite.from);
                    });
                }
                if ((chatLog.users.findIndex((user) => user === invite.from)) < 0)
                    chatLog.users.push(invite.from);
                this.saveLogs();
                cmLogger(`Joining chat ${invite.room}`);
                SocketManager.getInstance().joinChat(this.getCurrentUser(), invite.room, InviteType.ChatRoom);
                this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, false));
            }
        }
        else {
            cmLogger(`User ${invite.from} blocked`);
        }
    }
    receiveLogin(username) {
        cmLogger(`Handle login received for ${username}`);
        // keep track of the logged in users
        let index = this.loggedInUsers.findIndex((user) => user === username);
        if (index < 0)
            this.loggedInUsers.push(username);
        cmLogger(this.loggedInUsers);
        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(this.loggedInUsers));
        // if the user in in favourites and not in blocked list passing this on to the listener
        if (!this.isUserInBlockedList(username) && this.isUserInFavouriteList(username)) {
            cmLogger(`User ${username} logging in`);
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedIn(username));
        }
    }
    receiveLogout(username) {
        let index = this.loggedInUsers.findIndex((user) => user === username);
        if (index >= 0)
            this.loggedInUsers.splice(index, 1);
        this.chatUserListeners.forEach((listener) => listener.handleLoggedInUsersUpdated(this.loggedInUsers));
        // if the user in in favourites and not in blocked list passing this on to the listener
        if (!this.isUserInBlockedList(username) && this.isUserInFavouriteList(username)) {
            cmLogger(`User ${username} logging out`);
            this.chatUserListeners.forEach((listener) => listener.handleFavouriteUserLoggedOut(username));
        }
    }
    receiveDecline(room, username, type) {
        if (type !== InviteType.ChatRoom)
            return;
        // we get this for all changes to a room, if the username is us can safely ignore
        if (username === this.currentUsername)
            return;
        if (!this.isUserInBlockedList(username)) {
            cmLogger(`User ${username} declined invitation to room`);
            this.chatListeners.forEach((listener) => listener.handleInvitationDeclined(room, username));
        }
    }
    setUnreadCountListener(listener) {
        this.unreadListener = listener;
    }
    touchChatLog(room) {
        let chatLog = this.ensureChatLogExists(room);
        chatLog.unreadMessages = 0;
        chatLog.unreadHighMessages = 0;
        chatLog.unreadUrgentMessages = 0;
        chatLog.lastViewed = parseInt(moment().format('YYYYMMDDHHmmss'));
        this.emitUnreadMessageCountChanged();
        this.saveLogs();
    }
    getChatLog(room) {
        let log = null;
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        if (index >= 0)
            log = this.chatLogs[index];
        return log;
    }
    receiveMessage(message, wasOffline = false) {
        if (message.type !== InviteType.ChatRoom)
            return; // ignore messages that aren't for chat rooms
        // double check the message is not from us somehow
        if (message.from === this.getCurrentUser())
            return;
        // don't receive messages from the blocked users
        if (!this.isUserInBlockedList(message.from)) {
            // ok, so we need to add the message to the chat log, increase the new message count, save the logs and pass it on
            let chatLog = this.ensureChatLogExists(message.room);
            this.addSenderToRoomIfNotAlreadyPresent(chatLog, message.from);
            this.addMessageToChatLog(chatLog, message);
            cmLogger(`Message received`);
            cmLogger(message);
            // sending message acknowledgement
            SocketManager.getInstance().sendMessageReceived(message.id, this.getCurrentUser(), message.room);
            this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, wasOffline));
        }
        else {
            cmLogger(`Message received from user ${message.from} - is in blocked list, not passed on.`);
        }
    }
    receiveQueuedInvites(invites) {
        // just loop through and process each invite
        invites.forEach((invite) => {
            this.receiveInvitation(invite);
        });
    }
    receiveQueuedMessages(messages) {
        // just loop through a process each message
        messages.forEach((message) => {
            this.receiveMessage(message, true);
        });
        this.chatListeners.forEach((listener) => listener.handleOfflineMessagesReceived(messages));
    }
    joinChat(room) {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
        this.ensureChatLogExists(room);
        SocketManager.getInstance().joinChat(this.getCurrentUser(), room, InviteType.ChatRoom);
    }
    leaveChat(room) {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
        this.removeChatLog(room);
        SocketManager.getInstance().leaveChat(this.getCurrentUser(), room, InviteType.ChatRoom);
        this.emitUnreadMessageCountChanged();
    }
    login() {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
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
    logout() {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
        SocketManager.getInstance().logout(this.getCurrentUser());
    }
    declineInvite(room) {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
        SocketManager.getInstance().sendDeclineInvite(room, this.getCurrentUser(), InviteType.ChatRoom);
    }
    sendInvite(to, room, type = InviteType.ChatRoom, requiresAcceptDecline = false, subject = '') {
        if (this.getCurrentUser().trim().length === 0)
            return; // we are not logged in
        // can't accidentally send an invite to blacklisted
        if (this.isUserInBlockedList(to))
            return;
        // only send an invite if the user isn't already in the room
        const log = this.ensureChatLogExists(room);
        if (log.users.findIndex((user) => user === to) < 0) {
            SocketManager.getInstance().sendInvite(this.getCurrentUser(), to, room, type, requiresAcceptDecline, subject);
        }
    }
    sendMessage(room, content, priority = Priority.Normal, simpleAttachement, attachment) {
        if (this.getCurrentUser().trim().length === 0)
            return null; // we are not logged in
        let log = this.ensureChatLogExists(room);
        // send the message
        let created = parseInt(moment().format('YYYYMMDDHHmmss'));
        if (!(simpleAttachement))
            simpleAttachement = {
                identifier: '',
                type: '',
                displayText: ''
            };
        const id = v4();
        SocketManager.getInstance().sendMessage(id, this.getCurrentUser(), room, content, created, InviteType.ChatRoom, priority, simpleAttachement, {});
        // add the message to the chat log
        if (!attachment)
            attachment = {};
        let sent = {
            id: id,
            from: this.getCurrentUser(),
            room: room,
            message: content,
            created: created,
            priority: priority,
            type: InviteType.ChatRoom,
            simpleAttachment: simpleAttachement,
            attachment: attachment,
            received: false
        };
        this.addMessageToChatLog(log, sent);
        return sent;
    }
    getChatLogs() {
        return [...this.chatLogs];
    }
    startChatWithUser(username) {
        let roomName = null;
        if (username) {
            if (this.doesChatAlreadyExistWithUser(username)) {
                cmLogger(`Already started chat with ${username}`);
                const existingChatLog = this.getExistingChatLogWithUser(username);
                // ok, lets connect to the server
                if (existingChatLog) {
                    SocketManager.getInstance().joinChat(this.getCurrentUser(), existingChatLog.roomName, InviteType.ChatRoom);
                    roomName = existingChatLog.roomName;
                }
            }
            else {
                cmLogger(`Starting chat with ${username}`);
                // first thing, do we have a chat log with this user (and just this user) already?
                let chatLog = this.ensureChatLogExistsWithUser(username);
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
    doesChatAlreadyExistWithUser(username) {
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
    clearAllChatLogs() {
        this.chatLogs = [];
        this.saveLogs();
    }
    clearAllUserLists() {
        this.blockedList = [];
        this.saveBlockedList();
        this.favouriteList = [];
        this.saveFavouriteList();
    }
    reset() {
        this.clearAllChatLogs();
        this.clearAllUserLists();
    }
    saveLogs() {
        this.localStorage.setStateByName(ChatManager.chatLogKey + this.currentUsername, this.chatLogs, false);
    }
    saveBlockedList() {
        this.localStorage.setStateByName(ChatManager.blockedListKey + this.currentUsername, this.blockedList, false);
    }
    saveFavouriteList() {
        this.localStorage.setStateByName(ChatManager.favouriteListKey + this.currentUsername, this.favouriteList, false);
    }
    ensureChatLogExists(room) {
        let log;
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
            };
            this.chatLogs.push(log);
            this.saveLogs();
        }
        else {
            log = this.chatLogs[index];
        }
        return log;
    }
    getExistingChatLogWithUser(username) {
        let result = null;
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
    computeRoomName(username) {
        const currentUser = this.getCurrentUser().split(' ').join('').toLowerCase();
        const toUser = username.split(' ').join('').toLowerCase();
        let roomName = `${currentUser}-${toUser}`;
        if (toUser < currentUser) {
            roomName = `${toUser}-${currentUser}`;
        }
        return roomName;
    }
    ensureChatLogExistsWithUser(username) {
        let foundLog = null;
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
            };
            this.chatLogs.push(foundLog);
            this.saveLogs();
        }
        return foundLog;
    }
    doesChatRoomExist(room) {
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        return (index >= 0);
    }
    emitUnreadMessageCountChanged() {
        var _a;
        let unreadNormalMessages = 0;
        let unreadHighMessages = 0;
        let unreadUrgentMessages = 0;
        this.chatLogs.forEach((log) => {
            unreadNormalMessages += log.unreadMessages;
            unreadHighMessages += log.unreadHighMessages;
            unreadUrgentMessages += log.unreadUrgentMessages;
        });
        (_a = this.unreadListener) === null || _a === void 0 ? void 0 : _a.countChanged(unreadNormalMessages, unreadHighMessages, unreadUrgentMessages);
    }
    addMessageToChatLog(log, message) {
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
        }
        else {
            this.saveLogs();
        }
    }
    messageReceivedInChatLog(log, ack) {
        // update the message in the chat log to say is received
        const foundIndex = log.messages.findIndex((message) => message.id === ack.id);
        if (foundIndex >= 0) {
            const message = log.messages[foundIndex];
            message.received = true;
        }
        if (ack.receivedBy === this.getCurrentUser()) {
            this.touchChatLog(log.roomName); // this will also save the logs
        }
        else {
            this.saveLogs();
        }
    }
    addSenderToRoomIfNotAlreadyPresent(chatLog, sender) {
        let index = chatLog.users.findIndex((user) => user === sender);
        if (index < 0) {
            chatLog.users.push(sender);
        }
    }
    removeChatLog(room) {
        let index = this.chatLogs.findIndex((log) => log.roomName === room);
        if (index >= 0) {
            cmLogger(`Removing Chat log for room ${room}`);
            let result = this.chatLogs.splice(index, 1);
            cmLogger(result.length);
            this.saveLogs();
        }
    }
    receiveMessageReceived(message) {
        if (message.receivedBy === this.getCurrentUser())
            return;
        // don't receive messages from the blocked users
        if (!this.isUserInBlockedList(message.receivedBy)) {
            let chatLog = this.ensureChatLogExists(message.room);
            this.messageReceivedInChatLog(chatLog, message);
            cmLogger(`Message ack received`);
            cmLogger(message);
            this.chatListeners.forEach((listener) => listener.handleChatLogUpdated(chatLog, false));
        }
        else {
            cmLogger(`Message ack received from user ${message.receivedBy} - is in blocked list, not passed on.`);
        }
    }
}
ChatManager.chatLogKey = 'chat-logs';
ChatManager.blockedListKey = 'blocked-list';
ChatManager.favouriteListKey = 'favourite-list';
//# sourceMappingURL=ChatManager.js.map