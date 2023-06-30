export { };

declare global {
    interface Update {
        message?: Message;
    }

    interface Message {
        chat: Chat;
        text?: string;
    }

    interface Chat {
        id: number;
    }
}
