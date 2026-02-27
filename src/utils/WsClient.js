export class WSClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.heartTimer = null;
        this.reconnectTimer = null;
        this.reconnectDelay = 3000;
    }

    connect() {
        if (this.ws) return;

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("WS connected");
            this.startHeartBeat();
            this.ws.send({ msg_id: "login_req", option: 0 });
        };

        this.ws.onmessage = (e) => {
            switch (e.data.msg_id) {
                case "login_resp":
                    console.log("login message:", e.data);
                    break;
                default:
                    console.log("WS message:", e.data);
            }
        };

        this.ws.onerror = () => {
            console.log("WS error");
        };

        this.ws.onclose = () => {
            console.log("WS closed");
            this.stopHeartBeat();
            this.ws = null;
            this.reconnect();
        };
    }

    // 发送数据
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                typeof data === "string" ? data : JSON.stringify(data)
            );
        }
    }

    startHeartBeat() {
        this.heartTimer = setInterval(() => {
            this.send({ msg_id: "heartbeat_req", id: 100 });
        }, 5000);
    }

    stopHeartBeat() {
        clearInterval(this.heartTimer);
        this.heartTimer = null;
    }

    reconnect() {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            console.log("WS reconnecting...");
            this.reconnectTimer = null;
            this.connect();
        }, this.reconnectDelay);
    }

    close() {
        this.stopHeartBeat();
        this.ws && this.ws.close();
        this.ws = null;
    }
}