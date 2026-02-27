// src/utils/WsClient.js
var WSClient = class {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.heartTimer = null;
    this.reconnectTimer = null;
    this.reconnectDelay = 3e3;
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
    }, 5e3);
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
};

// src/components/FunctionArea.js
var FunctionArea = class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = '\n            <div class="func-area">\n                <button data-id="1" class="func-button">\u4FE1\u606F</button>\n                <button data-id="2" class="func-button">\u8BBE\u7F6E</button>\n                <button data-id="3" class="func-button">\u62A5\u8868</button>\n                <button data-id="4" class="func-button">\u9A8C\u8BC1</button>\n            </div>\n        ';
    this.querySelectorAll(".func-button").forEach((btn) => {
      btn.addEventListener("mousedown", () => {
        btn.classList.add("active");
        UIBus.emit("func-click", {
          id: btn.dataset.id
        });
      });
      btn.addEventListener("mouseup", () => {
        btn.classList.remove("active");
      });
      btn.addEventListener("mouseleave", () => {
        btn.classList.remove("active");
      });
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        btn.classList.add("active");
      });
      btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        btn.classList.remove("active");
        btn.classList.remove("hover");
        UIBus.emit("func-click", {
          id: btn.dataset.id
        });
      });
      btn.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        btn.classList.remove("active");
        btn.classList.remove("hover");
      });
    });
  }
  showInfo() {
    console.log("qw.............");
  }
};
customElements.define("function-area", FunctionArea);

// src/components/EventBus.js
var EventBus = class {
  constructor() {
    this.events = {};
  }
  on(event, cb) {
    if (!this.events[event]) {
      this.events[event] = /* @__PURE__ */ new Set();
    }
    this.events[event].add(cb);
  }
  off(event, cb) {
    var _a;
    (_a = this.events[event]) == null ? void 0 : _a.delete(cb);
  }
  emit(event, data) {
    var _a;
    console.log("[Event]", event, data);
    (_a = this.events[event]) == null ? void 0 : _a.forEach((cb) => cb(data));
  }
  once(event, cb) {
    const fn = (data) => {
      cb(data);
      this.off(event, fn);
    };
    this.on(event, fn);
  }
};
window.UIBus = new EventBus();

// src/utils/TimerManager.js
var TimerTask = class _TimerTask {
  constructor(options) {
    var _a;
    this.delay = options.delay || 0;
    this.interval = options.interval || 0;
    this.repeat = (_a = options.repeat) != null ? _a : -1;
    this.callback = options.callback;
    this.elapsed = 0;
    this.running = true;
    this.group = options.group || "default";
    this.id = _TimerTask._id++;
  }
  update(dt) {
    var _a, _b;
    if (!this.running) {
      return false;
    }
    this.elapsed += dt;
    if (this.elapsed < this.delay) {
      return false;
    }
    if (this.interval === 0) {
      (_a = this.callback) == null ? void 0 : _a.call(this);
      return true;
    }
    if (this.elapsed >= this.delay + this.interval) {
      this.elapsed -= this.interval;
      (_b = this.callback) == null ? void 0 : _b.call(this);
      if (this.repeat > 0) {
        this.repeat--;
        if (this.repeat === 0) {
          return true;
        }
      }
    }
    return false;
  }
};
TimerTask._id = 1;
var TimerManager = class {
  constructor() {
    this.tasks = [];
    this.running = false;
    this.timeScale = 1;
    this.lastTime = 0;
    this.pausedGroups = /* @__PURE__ */ new Set();
  }
  // =====================
  // Core Loop
  // =====================
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) {
        return;
      }
      let dt = (now - this.lastTime) * this.timeScale;
      this.lastTime = now;
      this.update(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  stop() {
    this.running = false;
  }
  update(dt) {
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      let task = this.tasks[i];
      if (this.pausedGroups.has(task.group)) {
        continue;
      }
      let done = task.update(dt);
      if (done) {
        this.tasks.splice(i, 1);
      }
    }
  }
  // =====================
  // Timer Create
  // =====================
  once(delay, callback, group) {
    return this._addTask({
      delay,
      interval: 0,
      repeat: 0,
      callback,
      group
    });
  }
  interval(interval, callback, repeat = -1, group) {
    return this._addTask({
      delay: 0,
      interval,
      repeat,
      callback,
      group
    });
  }
  frame(callback, repeat = -1, group) {
    return this._addTask({
      delay: 0,
      interval: 16,
      repeat,
      callback,
      group
    });
  }
  wait(delay) {
    return new Promise((resolve) => {
      this.once(delay, resolve);
    });
  }
  _addTask(opt) {
    let task = new TimerTask(opt);
    this.tasks.push(task);
    return task.id;
  }
  // =====================
  // Control
  // =====================
  remove(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }
  clearGroup(group) {
    this.tasks = this.tasks.filter((t) => t.group !== group);
  }
  pauseGroup(group) {
    this.pausedGroups.add(group);
  }
  resumeGroup(group) {
    this.pausedGroups.delete(group);
  }
  clearAll() {
    this.tasks.length = 0;
  }
};
var Timer = new TimerManager();
Timer.start();

// src/components/DealArea.js
var DealArea = class extends HTMLElement {
  constructor() {
    super();
    this.timer = 10;
    this.timerId = -1;
  }
  connectedCallback() {
    this.innerHTML = '<div class="deal-area">\n            <div class="hand-left">\n                <div class="hand-titile">\n                    <span data-i18n="player_label" class="player_label">\u95F2 (Player)</span>\n                    <span id="score-player" class="score">0</span>\n                </div>\n                <div class="cards-box" id="cards-player"></div>\n            </div>\n            <div class="vs-divider">VS</div>\n            <div class="hand-right">\n                <div class="hand-titile">\n                    <span data-i18n="banker_label" class="banker_label">\u5E84 (Banker)</span>\n                    <span id="score-banker" class="score">0</span>\n                </div>\n                <div class="cards-box" id="cards-banker">\n                </div>\n            </div>\n            <div class="table">\u5C40ID:1123345</div>\n            <div class="countdown">10</div>\n        </div>';
    this.scorePlayer = this.querySelector("#score-player");
    this.scoreBanker = this.querySelector("#score-banker");
    this.cardPlayer = this.querySelector("#cards-player");
    this.cardBanker = this.querySelector("#cards-banker");
    this.tableId = this.querySelector(".table");
    this.countdown = this.querySelector(".countdown");
  }
  // 移除DOM时
  disconnectedCallback() {
  }
  // 属性变化时
  attributeChangedCallback() {
  }
  showCountdown() {
    this.countdown.hidden = false;
    this.timer = 10;
    this.countdown.textContent = this.timer;
    Timer.remove(this.timerId);
    this.timerId = Timer.interval(1e3, () => {
      this.timer--;
      this.countdown.textContent = this.timer;
      if (this.timer <= 0) {
        this.countdown.hidden = true;
        Timer.remove(this.timerId);
      }
    }, 10);
  }
  hideCountdown() {
    this.countdown.hidden = true;
  }
};
customElements.define("deal-area", DealArea);

// src/components/BetArea.js
var BetArea = class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = '<div class="betting-area" style="position: relative;">\n        <div class="bet-grid">\n            <div class="side-bets-row">\n                <button class="bet-btn bet-lucky7" id="bet-lucky7">\n                    <div class="bet-number">\n                        <span id="s-area-1">0</span>/<span id="t-area-1">0</span>\n                    </div>\n                    <div class="side-label" data-i18n="lucky7">\u5E78\u8FD07</div>\n                    <div class="odds">1:6/15</div>\n                </button>\n                <button class="bet-btn bet-super-lucky7" id="bet-super-lucky7">\n                    <div class="bet-number">\n                        <span id="s-area-2">0</span>/<span id="t-area-2">0</span>\n                    </div>\n                    <div class="side-label" data-i18n="super_lucky7">\u8D85\u5E787</div>\n                    <div class="odds">1:30+</div>\n                </button>\n                <button class="bet-btn bet-lucky6" id="bet-lucky6">\n                    <div class="bet-number">\n                        <span id="s-area-3">0</span>/<span id="t-area-3">0</span>\n                    </div>\n                    <div class="side-label" data-i18n="lucky6">\u5E786(2/3)</div>\n                    <div class="odds">1:12/20</div>\n                </button>\n                <button class="bet-btn bet-lucky6-2" id="bet-lucky6-2">\n                    <div class="bet-number">\n                        <span id="s-area-4">0</span>/<span id="t-area-4">0</span>\n                    </div>\n                    <div class="side-label" data-i18n="lucky6_2">\u5E786(2\u5F20)</div>\n                    <div class="odds">1:22</div>\n                </button>\n                <button class="bet-btn bet-lucky6-3" id="bet-lucky6-3">\n                    <div class="bet-number">\n                        <span id="s-area-5">0</span>/<span id="t-area-5">0</span>\n                    </div>\n                    <div class="side-label" data-i18n="lucky6_3">\u5E786(3\u5F20)</div>\n                    <div class="odds">1:50</div>\n                </button>\n            </div>\n            <button class="bet-btn bet-player-pair" id="bet-player-pair">\n                <div>\n                    <span id="s-area-6">0</span>/<span id="t-area-6">0</span>\n                </div>\n                <div data-i18n="player_pair">\u95F2\u5BF9</div>\n                <div class="odds">1:11</div>\n            </button>\n            <button class="bet-btn bet-tie" id="bet-tie">\n                <div class="bet-number">\n                    <span id="s-area-7">0</span>/<span id="t-area-7">0</span>\n                </div>\n                <div data-i18n="tie">\u548C</div>\n                <div class="odds">1:8</div>\n            </button>\n            <button class="bet-btn bet-banker-pair" id="bet-banker-pair">\n                <div class="bet-number">\n                    <span id="s-area-8">0</span>/<span id="t-area-8">0</span>\n                </div>\n                <div data-i18n="banker_pair">\u5E84\u5BF9</div>\n                <div class="odds">1:11</div>\n            </button>\n            <button class="bet-btn bet-player-main" id="bet-player">\n                <div class="bet-number" style="font-size:36px">\n                    <span id="s-area-9" style="font-size:42px">0</span>/<span id="t-area-9" style="font-size:42px">0</span>\n                </div>\n                <div class="main-label" data-i18n="player_main">\u95F2</div>\n                <div class="odds" style="font-size:32px">1:1</div>\n            </button>\n            <button class="bet-btn bet-banker-main" id="bet-banker">\n                <div class="bet-number" style="font-size:36px">\n                    <span id="s-area-10" style="font-size:42px">0</span>/<span id="t-area-10" style="font-size:42px">0</span>\n                </div>\n                <div class="main-label" data-i18n="banker_main">\u5E84</div>\n                <div class="odds" id="banker-odds" style="font-size:32px">0.95:1</div>\n            </button>\n        </div>\n        <div class="controls-bar">\n            <div class="chip-container">\n                <div class="chip-item" data-value="1">\n                    <img class="chip-style" src="assets/chip_1.png">\n                    <span class="chip-text">1</span>\n                </div>\n                <div class="chip-item" data-value="5">\n                    <img class="chip-style" src="assets/chip_2.png">\n                    <span class="chip-text">5</span>\n                </div>\n                <div class="chip-item" data-value="10">\n                    <img class="chip-style" src="assets/chip_3.png">\n                    <span class="chip-text">10</span>\n                </div>\n                <div class="chip-item" data-value="50">\n                    <img class="chip-style" src="assets/chip_4.png">\n                    <span class="chip-text">50</span>\n                </div>\n                <div class="chip-item" data-value="100">\n                    <img class="chip-style" src="assets/chip_5.png">\n                    <span class="chip-text">100</span>\n                </div>\n            </div>\n            <div class="action-group">\n                <button id="btn-clear" class="func-button" data-i18n="btn_clear">\u6E05\u9664</button>\n                <div class="pepole" data-value="100">\n                    <img class="pepole-style" src="assets/pepole.png">\n                    <span class="pepole-text">100</span>\n                </div></div></div></div>';
    const betMap = {
      "bet-player": "player",
      "bet-banker": "banker",
      "bet-tie": "tie",
      "bet-player-pair": "playerPair",
      "bet-banker-pair": "bankerPair",
      "bet-lucky6": "lucky6",
      "bet-lucky6-2": "lucky6_2",
      "bet-lucky6-3": "lucky6_3",
      "bet-lucky7": "lucky7",
      "bet-super-lucky7": "superLucky7"
    };
    for (const entry of Object.entries(betMap)) {
      const id = entry[0];
      const type = entry[1];
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("mousedown", () => {
          btn.classList.add("active");
        });
        btn.addEventListener("mouseup", () => {
          btn.classList.remove("active");
        });
        btn.addEventListener("mouseleave", () => {
          btn.classList.remove("active");
        });
        btn.addEventListener("touchstart", (e) => {
          e.preventDefault();
          btn.classList.add("active");
        });
        btn.addEventListener("touchend", (e) => {
          e.preventDefault();
          btn.classList.remove("active");
        });
        btn.addEventListener("touchcancel", (e) => {
          e.preventDefault();
          btn.classList.remove("active");
        });
      }
    }
    this.chips = this.querySelectorAll(".chip-item");
    let currentChip = null;
    this.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.chips.forEach((c) => c.classList.remove("chip-selected"));
        chip.classList.add("chip-selected");
        currentChip = chip.dataset.value;
        console.log("\u5F53\u524D\u7B79\u7801:", currentChip);
      });
    });
  }
};
customElements.define("bet-area", BetArea);

// src/utils/Adapt.js
var DESIGN_W = 1080;
var DESIGN_H = 1920;
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function fixIOSHeight() {
  document.documentElement.style.setProperty(
    "--vh",
    window.innerHeight * 0.01 + "px"
  );
}
function adaptGame() {
  const shell = document.getElementById("phone-shell");
  const game = document.getElementById("game-container");
  let w, h;
  if (isMobile()) {
    w = window.innerWidth;
    h = window.innerHeight;
  } else {
    w = shell.clientWidth;
    h = shell.clientHeight;
  }
  const scale = Math.min(
    w / DESIGN_W,
    h / DESIGN_H
  );
  game.style.transform = "translate(-50%, -50%) scale(".concat(scale, ")");
  fixIOSHeight();
}
function adaptLayout() {
  const shell = document.getElementById("phone-shell");
  const wrapper = document.getElementById("pc-wrapper");
  if (isMobile()) {
    shell.style.width = "100%";
    shell.style.height = "100%";
    shell.style.borderRadius = "0";
    shell.style.boxShadow = "none";
    wrapper.style.alignItems = "stretch";
  }
}
function disableDoubleTapZoom() {
  let lastTouchTime = 0;
  document.addEventListener("touchstart", function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  });
  document.addEventListener("touchend", function(event) {
    const now = (/* @__PURE__ */ new Date()).getTime();
    if (now - lastTouchTime < 300) {
      event.preventDefault();
    }
    lastTouchTime = now;
  }, false);
}
function disableIOSDoubleTap() {
  document.addEventListener("touchstart", function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
  document.addEventListener("gesturestart", function(event) {
    event.preventDefault();
  }, { passive: false });
  document.addEventListener("gesturechange", function(event) {
    event.preventDefault();
  }, { passive: false });
  document.addEventListener("gestureend", function(event) {
    event.preventDefault();
  }, { passive: false });
}

// src/index.js
var App = class {
  constructor() {
    this.init();
  }
  init() {
    window.addEventListener("resize", adaptGame);
    window.addEventListener("orientationchange", adaptGame);
    adaptLayout();
    adaptGame();
    disableIOSDoubleTap();
    let lastTouchEnd = 0;
    document.addEventListener("touchend", function(event) {
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    window.addEventListener("load", disableDoubleTapZoom);
    this.funcArea = document.getElementById("function-area");
    this.dealArea = document.getElementById("deal-area");
    this.funcArea.showInfo();
    this.ws = new WSClient("ws:192.168.100.62:6006/ws");
    this.ws.connect();
    UIBus.on("func-click", (data) => {
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
};
var app = new App();
app.run();
//# sourceMappingURL=index.js.map
