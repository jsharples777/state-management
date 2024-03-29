import debug from 'debug';
import {ClientDataMessage, SocketListener} from "./SocketListener";
import {ChatReceiver} from "./ChatReceiver";
import {InviteType, Message, MessageReceived, Priority, SimpleAttachment} from "./Types";
import {SecurityManager} from "../security/SecurityManager";

const sDebug = debug('socket-ts');

export class SocketManager {
    private static _instance: SocketManager;
    protected listeners: SocketListener[] = [];
    protected socket: any | null;
    protected chatReceivers: ChatReceiver[] = [];
    private isInitialised: boolean = false;

    constructor() {
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

    public static getInstance(): SocketManager {
        if (!(SocketManager._instance)) {
            SocketManager._instance = new SocketManager();
        }
        return SocketManager._instance;
    }

    public addChatReceiver(receiver: ChatReceiver): void {
        this.chatReceivers.push(receiver);
    }

    public addListener(listener: SocketListener) {
        sDebug('Adding listener');
        this.listeners.push(listener);
        if (!(this.isInitialised)) {
            this.isInitialised = true;
            this.initialise();
        }
    }

    public initialise() {
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

    public login(username: string): void {
        this.socket.emit('login', {username});
    }

    public logout(username: string): void {
        this.socket.emit('logout', {username});
    }

    public joinChat(username: string, room: string, type: number): void {
        this.socket.emit('joinroom', {username, room, type});
    }

    public leaveChat(username: string, room: string, type: number): void {
        this.socket.emit('exitroom', {username, room, type});
    }

    public sendInvite(from: string, to: string, room: string, type: InviteType = InviteType.ChatRoom, requiresAcceptDecline: boolean = false, subject: string = '', attachment: any = {}) {
        let inviteObj: any = {
            from: from,
            to: to,
            room: room,
            type: type,
            requiresAcceptDecline: requiresAcceptDecline,
            subject: subject,
            attachment: attachment
        }
        sDebug(`Sending invite`);
        sDebug(inviteObj);
        this.socket.emit('invite', inviteObj);
    }

    public sendMessage(id:string, from: string, room: string, message: string, created: number, type: number, priority: Priority = Priority.Normal, simpleAttachment: SimpleAttachment, attachment: any = {}) {
        let messageObj: Message = {
            id:id,
            from: from,
            room: room,
            message: message,
            created: created,
            priority: priority,
            type: type,
            simpleAttachment: simpleAttachment,
            attachment: attachment,
            received: false
        }
        this.socket.emit('chat', messageObj);
    }

    public sendMessageReceived(id:string, receivedBy: string, room: string) {
        let messageObj: MessageReceived = {
            id:id,
            receivedBy: receivedBy,
            room: room,
         }
        this.socket.emit('chatReceived', messageObj);
    }

    public getUserList() {
        this.socket.emit('userlist');
    }

    public sendDeclineInvite(room: string, from: string, type: number) {
        this.socket.emit('declineinvite', {room, from, type});
    }

    private callbackForMessage(content: any): void {
        sDebug(`Received message : ${content}`);
        try {
            sDebug(content);
            // should be a server side ChatMessage {room, message,user}
            const dataObj = JSON.parse(content);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessage(dataObj));
        } catch (err) {
            sDebug(err);
            sDebug('Not JSON data');
        }
    }

    private callbackForLogin(message: any): void {
        sDebug(`Received login : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveLogin(message));
    }

    private callbackForUserList(message: any): void {
        sDebug(`Received user list : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveUserList(message));
    }

    private callbackForLogout(message: any): void {
        sDebug(`Received logout : ${message}`);
        this.chatReceivers.forEach((receiver) => receiver.receiveLogout(message));
    }

    private callbackForJoinRoom(data: any): void {
        sDebug(`Received joined room : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveJoinedRoom(dataObj));
        } catch (err) {
            sDebug('Not JSON data');
        }
    }

    private callbackForExitRoom(data: any): void {
        sDebug(`Received left room : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receivedLeftRoom(dataObj));
        } catch (err) {
            sDebug('Not JSON data');
        }
    }

    private callbackForInvite(data: any): void {
        sDebug(`Received invite : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveInvitation(dataObj));
        } catch (err) {
            sDebug('Not JSON data');
        }
    }

    private callbackForDeclineInvite(data: any): void {
        sDebug(`Received declined invite : ${data}`);
        try {
            const dataObj = JSON.parse(data);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveDecline(dataObj.room, dataObj.username, dataObj.type));
        } catch (err) {
            sDebug(err);
            sDebug('Not JSON data');
        }
    }

    private callbackForChat(content: any): void {
        sDebug(`Received chat : ${content}`);
        try {
            // should be a server side ChatMessage {room, message,user}
            const dataObj = JSON.parse(content);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessage(dataObj));
        } catch (err) {
            sDebug('Not JSON data');
        }
    }

    private callbackForChatReceived(content: any): void {
        sDebug(`Received message received : ${content}`);
        try {
            const dataObj = JSON.parse(content);
            sDebug(dataObj);
            this.chatReceivers.forEach((receiver) => receiver.receiveMessageReceived(dataObj));
        } catch (err) {
            sDebug('Not JSON data');
        }
    }
    private callbackForQueue(data: any): void {
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
        } catch (err) {
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
    private callbackForData(message: any): void {
        sDebug(`Received data`);
        try {
            const dataObj = JSON.parse(message);
            sDebug(dataObj);
            if (dataObj.user === SecurityManager.getInstance().getCurrentUser()) {
                sDebug("change made by this user, ignoring");
            } else {
                sDebug("change made by another user, passing off to the application");
                this.listeners.forEach((listener) => listener.handleDataChangedByAnotherUser(<ClientDataMessage>dataObj));
            }
        } catch (err) {
            sDebug('Not JSON data');
        }
    }
}
