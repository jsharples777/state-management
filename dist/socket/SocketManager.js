import debug from 'debug';
import { InviteType, Priority } from "./Types";
import { SecurityManager } from "../security/SecurityManager";
const sDebug = debug('socket-ts');
export class SocketManager {
    constructor() {
        this.listeners = [];
        this.chatReceivers = [];
        this.isInitialised = false;
        this.socket = null;
        this.callbackForMessage = this.callbackForMessage.bind(this);
        this.callbackForData = this.callbackForData.bind(this);
        this.callbackForMessage = this.callbackForMessage.bind(this);
        this.callbackForLogin = this.callbackForLogin.bind(this);
        this.callbackForLogout = this.callbackForLogout.bind(this);
        this.callbackForJoinRoom = this.callbackForJoinRoom.bind(this);
        this.callbackForExitRoom = this.callbackForExitRoom.bind(this);
        this.callbackForInvite = this.callbackForInvite.bind(this);
        this.callbackForChat = this.callbackForChat.bind(this);
        this.callbackForChatReceived = this.callbackForChatReceived.bind(this);
        this.callbackForQueue = this.callbackForQueue.bind(this);
        this.callbackForUserList = this.callbackForUserList.bind(this);
        this.callbackForDeclineInvite = this.callbackForDeclineInvite.bind(this);
    }
    static getInstance() {
        if (!(SocketManager._instance)) {
            SocketManager._instance = new SocketManager();
        }
        return SocketManager._instance;
    }
    addChatReceiver(receiver) {
        this.chatReceivers.push(receiver);
    }
    addListener(listener) {
        sDebug('Adding listener');
        this.listeners.push(listener);
        if (!(this.isInitialised)) {
            this.isInitialised = true;
            this.initialise();
        }
    }
    initialise() {
        sDebug('Creating socket connection');
        // @ts-ignore
        this.socket = io();
        sDebug('Waiting for messages');
        this.socket.on('message', this.callbackForMessage);
        this.socket.on('data', this.callbackForData);
        this.socket.on('login', this.callbackForLogin);
        this.socket.on('logout', this.callbackForLogout);
        this.socket.on('joinroom', this.callbackForJoinRoom);
        this.socket.on('exitroom', this.callbackForExitRoom);
        this.socket.on('invite', this.callbackForInvite);
        this.socket.on('declineinvite', this.callbackForDeclineInvite);
        this.socket.on('chat', this.callbackForChat);
        this.socket.on('chatReceived', this.callbackForChatReceived);
        this.socket.on('queue', this.callbackForQueue);
        this.socket.on('userlist', this.callbackForUserList);
    }
    login(username) {
        this.socket.emit('login', { username });
    }
    logout(username) {
        this.socket.emit('logout', { username });
    }
    joinChat(username, room, type) {
        this.socket.emit('joinroom', { username, room, type });
    }
    leaveChat(username, room, type) {
        this.socket.emit('exitroom', { username, room, type });
    }
    sendInvite(from, to, room, type = InviteType.ChatRoom, requiresAcceptDecline = false, subject = '', attachment = {}) {
        let inviteObj = {
            from: from,
            to: to,
            room: room,
            type: type,
            requiresAcceptDecline: requiresAcceptDecline,
            subject: subject,
            attachment: attachment
        };
        sDebug(`Sending invite`);
        sDebug(inviteObj);
        this.socket.emit('invite', inviteObj);
    }
    sendMessage(id, from, room, message, created, type, priority = Priority.Normal, simpleAttachment, attachment = {}) {
        let messageObj = {
            id: id,
            from: from,
            room: room,
            message: message,
            created: created,
            priority: priority,
            type: type,
            simpleAttachment: simpleAttachment,
            attachment: attachment,
            received: false
        };
        this.socket.emit('chat', messageObj);
    }
    sendMessageReceived(id, receivedBy, room) {
        let messageObj = {
            id: id,
            receivedBy: receivedBy,
            room: room,
        };
        this.socket.emit('chatReceived', messageObj);
    }
    getUserList() {
        this.socket.emit('userlist');
    }
    sendDeclineInvite(room, from, type) {
        this.socket.emit('declineinvite', { room, from, type });
    }
    callbackForMessage(content) {
        sDebug(`Received message : ${content}`);
        try {
            sDebug(content);
            // should be a server side ChatMessage {room, message,user}
            const dataObj = JSON.parse(content);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessage(dataObj));
        }
        catch (err) {
            sDebug(err);
            sDebug('Not JSON data');
        }
    }
    callbackForLogin(message) {
        sDebug(`Received login : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveLogin(message));
    }
    callbackForUserList(message) {
        sDebug(`Received user list : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveUserList(message));
    }
    callbackForLogout(message) {
        sDebug(`Received logout : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveLogout(message));
    }
    callbackForJoinRoom(data) {
        sDebug(`Received joined room : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveJoinedRoom(dataObj));
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    callbackForExitRoom(data) {
        sDebug(`Received left room : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receivedLeftRoom(dataObj));
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    callbackForInvite(data) {
        sDebug(`Received invite : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveInvitation(dataObj));
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    callbackForDeclineInvite(data) {
        sDebug(`Received declined invite : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveDecline(dataObj.room, dataObj.username, dataObj.type));
        }
        catch (err) {
            sDebug(err);
            sDebug('Not JSON data');
        }
    }
    callbackForChat(content) {
        sDebug(`Received chat : ${content}`);
        try {
            // should be a server side ChatMessage {room, message,user}
            const dataObj = JSON.parse(content);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessage(dataObj));
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    callbackForChatReceived(content) {
        sDebug(`Received message received : ${content}`);
        try {
            const dataObj = JSON.parse(content);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessageReceived(dataObj));
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    callbackForQueue(data) {
        sDebug(`Received queued items : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            // this object should contain two arrays of invites and messages
            if (dataObj.invites && (dataObj.invites.length > 0)) {
                this.chatReceivers.forEach((receiver) => receiver.receiveQueuedInvites(dataObj.invites));
            }
            if (dataObj.messages && (dataObj.messages.length > 0)) {
                this.chatReceivers.forEach((receiver) => receiver.receiveQueuedMessages(dataObj.messages));
            }
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
    /*
    *
    *  expecting a JSON data object with the following attributes
    *  1.  type: "create"|"update"|"delete"
    *  2.  objectType: string name of the object type changed
    *  3.  data: the new representation of the object
    *  4.  user: application specific id for the user who made the change
    *        - the application view is required to implement getCurrentUser() to compare the user who made the change
    *
     */
    callbackForData(message) {
        sDebug(`Received data`);
        try {
            const dataObj = JSON.parse(message);
            sDebug(dataObj);
            if (dataObj.user === SecurityManager.getInstance().getCurrentUser()) {
                sDebug("change made by this user, ignoring");
            }
            else {
                sDebug("change made by another user, passing off to the application");
                this.listeners.forEach((listener) => listener.handleDataChangedByAnotherUser(dataObj));
            }
        }
        catch (err) {
            sDebug('Not JSON data');
        }
    }
}
//# sourceMappingURL=SocketManager.js.map