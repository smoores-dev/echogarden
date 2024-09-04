export class SignalChannel {
    channel;
    constructor() {
        this.channel = new MessageChannel();
    }
    on(signalName, handler) {
        this.channel.port2.onmessage = (event) => {
            if (event.data.signalName != signalName) {
                return;
            }
            handler(event.data.data);
        };
    }
    send(signalName, data) {
        this.channel.port1.postMessage({ signalName, data });
    }
}
//# sourceMappingURL=SignalChannel.js.map