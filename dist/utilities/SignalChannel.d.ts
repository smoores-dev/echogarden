export declare class SignalChannel {
    channel: MessageChannel;
    constructor();
    on(signalName: string, handler: (data?: any) => void): void;
    send(signalName: string, data?: any): void;
}
