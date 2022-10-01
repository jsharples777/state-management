export declare type Invitation = {
    from: string;
    room: string;
    message: string;
    created: number;
    userList: string[];
    type: InviteType;
    requiresAcceptDecline: boolean;
    subject: string;
    attachment: any;
};
export declare type SimpleAttachment = {
    identifier: string;
    type: string;
    displayText: string;
    iconClasses?: string;
};
export declare type Message = {
    id: string;
    from: string;
    room: string;
    message: string;
    created: number;
    priority: number;
    type: InviteType;
    simpleAttachment?: SimpleAttachment;
    attachment?: any;
    received: boolean;
};
export declare type MessageReceived = {
    id: string;
    room: string;
    receivedBy: string;
};
export declare type JoinLeft = {
    username: string;
    room: string;
    userList: string[];
    type: InviteType;
};
export declare enum Priority {
    Normal = 0,
    High = 1,
    Urgent = 2
}
export declare enum InviteType {
    ChatRoom = 0,
    CustomType1 = 1,
    CustomType2 = 2,
    CustomType3 = 3,
    CustomType4 = 4,
    CustomType5 = 5,
    CustomType6 = 6,
    CustomType7 = 7,
    CustomType8 = 8,
    CustomType9 = 9
}
export declare type ChatLog = {
    roomName: string;
    type: InviteType;
    users: string[];
    messages: Message[];
    lastViewed: number;
    unreadMessages: number;
    unreadHighMessages: number;
    unreadUrgentMessages: number;
};
