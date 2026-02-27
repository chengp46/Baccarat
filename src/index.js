import { WSClient } from "./utils/WsClient.js";
import { FunctionArea } from "./components/FunctionArea.js";
import { EventBus } from "./components/EventBus.js";
import { DealArea } from "./components/DealArea.js";
import { BetArea } from "./components/BetArea.js";
import { adaptGame, adaptLayout, disableDoubleTapZoom, disableIOSDoubleTap } from "./utils/Adapt.js"

class App {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener("resize", adaptGame);
        window.addEventListener("orientationchange", adaptGame);
        adaptLayout();
        adaptGame();
        disableIOSDoubleTap();
        // 防止触摸事件的双击（移动端）
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        // 页面加载后调用
        window.addEventListener('load', disableDoubleTapZoom);

        this.funcArea = document.getElementById("function-area");
        this.dealArea = document.getElementById("deal-area");
        this.funcArea.showInfo();
        this.ws = new WSClient("ws:192.168.100.62:6006/ws");
        this.ws.connect();
        
        UIBus.on("func-click", data => {
            switch (data.id) {
                case "1":
                    this.dealArea.hideCountdown();
                    break;
                case "2":
                    this.dealArea.showCountdown();
                    break;
            }
        });
    }

    run() {

    }
}

let app = new App();
app.run();