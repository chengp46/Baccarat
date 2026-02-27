export class BetArea extends HTMLElement {
    constructor() {
        super();

    }

    connectedCallback() {
        this.innerHTML = `<div class="betting-area" style="position: relative;">
        <div class="bet-grid">
            <div class="side-bets-row">
                <button class="bet-btn bet-lucky7" id="bet-lucky7">
                    <div class="bet-number">
                        <span id="s-area-1">0</span>/<span id="t-area-1">0</span>
                    </div>
                    <div class="side-label" data-i18n="lucky7">幸运7</div>
                    <div class="odds">1:6/15</div>
                </button>
                <button class="bet-btn bet-super-lucky7" id="bet-super-lucky7">
                    <div class="bet-number">
                        <span id="s-area-2">0</span>/<span id="t-area-2">0</span>
                    </div>
                    <div class="side-label" data-i18n="super_lucky7">超幸7</div>
                    <div class="odds">1:30+</div>
                </button>
                <button class="bet-btn bet-lucky6" id="bet-lucky6">
                    <div class="bet-number">
                        <span id="s-area-3">0</span>/<span id="t-area-3">0</span>
                    </div>
                    <div class="side-label" data-i18n="lucky6">幸6(2/3)</div>
                    <div class="odds">1:12/20</div>
                </button>
                <button class="bet-btn bet-lucky6-2" id="bet-lucky6-2">
                    <div class="bet-number">
                        <span id="s-area-4">0</span>/<span id="t-area-4">0</span>
                    </div>
                    <div class="side-label" data-i18n="lucky6_2">幸6(2张)</div>
                    <div class="odds">1:22</div>
                </button>
                <button class="bet-btn bet-lucky6-3" id="bet-lucky6-3">
                    <div class="bet-number">
                        <span id="s-area-5">0</span>/<span id="t-area-5">0</span>
                    </div>
                    <div class="side-label" data-i18n="lucky6_3">幸6(3张)</div>
                    <div class="odds">1:50</div>
                </button>
            </div>
            <button class="bet-btn bet-player-pair" id="bet-player-pair">
                <div>
                    <span id="s-area-6">0</span>/<span id="t-area-6">0</span>
                </div>
                <div data-i18n="player_pair">闲对</div>
                <div class="odds">1:11</div>
            </button>
            <button class="bet-btn bet-tie" id="bet-tie">
                <div class="bet-number">
                    <span id="s-area-7">0</span>/<span id="t-area-7">0</span>
                </div>
                <div data-i18n="tie">和</div>
                <div class="odds">1:8</div>
            </button>
            <button class="bet-btn bet-banker-pair" id="bet-banker-pair">
                <div class="bet-number">
                    <span id="s-area-8">0</span>/<span id="t-area-8">0</span>
                </div>
                <div data-i18n="banker_pair">庄对</div>
                <div class="odds">1:11</div>
            </button>
            <button class="bet-btn bet-player-main" id="bet-player">
                <div class="bet-number" style="font-size:36px">
                    <span id="s-area-9" style="font-size:42px">0</span>/<span id="t-area-9" style="font-size:42px">0</span>
                </div>
                <div class="main-label" data-i18n="player_main">闲</div>
                <div class="odds" style="font-size:32px">1:1</div>
            </button>
            <button class="bet-btn bet-banker-main" id="bet-banker">
                <div class="bet-number" style="font-size:36px">
                    <span id="s-area-10" style="font-size:42px">0</span>/<span id="t-area-10" style="font-size:42px">0</span>
                </div>
                <div class="main-label" data-i18n="banker_main">庄</div>
                <div class="odds" id="banker-odds" style="font-size:32px">0.95:1</div>
            </button>
        </div>
        <div class="controls-bar">
            <div class="chip-container">
                <div class="chip-item" data-value="1">
                    <img class="chip-style" src="assets/chip_1.png">
                    <span class="chip-text">1</span>
                </div>
                <div class="chip-item" data-value="5">
                    <img class="chip-style" src="assets/chip_2.png">
                    <span class="chip-text">5</span>
                </div>
                <div class="chip-item" data-value="10">
                    <img class="chip-style" src="assets/chip_3.png">
                    <span class="chip-text">10</span>
                </div>
                <div class="chip-item" data-value="50">
                    <img class="chip-style" src="assets/chip_4.png">
                    <span class="chip-text">50</span>
                </div>
                <div class="chip-item" data-value="100">
                    <img class="chip-style" src="assets/chip_5.png">
                    <span class="chip-text">100</span>
                </div>
            </div>
            <div class="action-group">
                <button id="btn-clear" class="func-button" data-i18n="btn_clear">清除</button>
                <div class="pepole" data-value="100">
                    <img class="pepole-style" src="assets/pepole.png">
                    <span class="pepole-text">100</span>
                </div></div></div></div>`;

        const betMap = {
            'bet-player': 'player',
            'bet-banker': 'banker',
            'bet-tie': 'tie',
            'bet-player-pair': 'playerPair',
            'bet-banker-pair': 'bankerPair',
            'bet-lucky6': 'lucky6',
            'bet-lucky6-2': 'lucky6_2',
            'bet-lucky6-3': 'lucky6_3',
            'bet-lucky7': 'lucky7',
            'bet-super-lucky7': 'superLucky7'
        };

        for (const entry of Object.entries(betMap)) {
            const id = entry[0];
            const type = entry[1];
            const btn = document.getElementById(id);
            if (btn) {
                // 处理桌面端点击
                btn.addEventListener("mousedown", () => {
                    btn.classList.add('active');
                });
                btn.addEventListener("mouseup", () => {
                    btn.classList.remove('active');
                });
                btn.addEventListener("mouseleave", () => {
                    btn.classList.remove('active');
                });
                btn.addEventListener("touchstart", (e) => {
                    e.preventDefault(); // 防止默认行为
                    btn.classList.add('active');
                });
                btn.addEventListener("touchend", (e) => {
                    e.preventDefault();
                    btn.classList.remove('active');
                    // // 触发点击事件
                    // UIBus.emit("func-click", {
                    //     id: btn.dataset.id
                    // });
                });
                btn.addEventListener("touchcancel", (e) => {
                    e.preventDefault();
                    btn.classList.remove('active');
                });
            }
        }

        this.chips = this.querySelectorAll(".chip-item");
        let currentChip = null;
        this.chips.forEach(chip => {
            chip.addEventListener("click", () => {
                this.chips.forEach(c => c.classList.remove("chip-selected"));
                chip.classList.add("chip-selected");
                currentChip = chip.dataset.value;
                console.log("当前筹码:", currentChip);
            });
        });

    }
}

customElements.define("bet-area", BetArea);