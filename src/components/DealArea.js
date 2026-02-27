import { Timer } from "../utils/TimerManager";
export class DealArea extends HTMLElement {

    constructor() {
        super();
        this.timer = 10;
        this.timerId = -1;
    }

    connectedCallback() {
        this.innerHTML = `<div class="deal-area">
            <div class="hand-left">
                <div class="hand-titile">
                    <span data-i18n="player_label" class="player_label">闲 (Player)</span>
                    <span id="score-player" class="score">0</span>
                </div>
                <div class="cards-box" id="cards-player"></div>
            </div>
            <div class="vs-divider">VS</div>
            <div class="hand-right">
                <div class="hand-titile">
                    <span data-i18n="banker_label" class="banker_label">庄 (Banker)</span>
                    <span id="score-banker" class="score">0</span>
                </div>
                <div class="cards-box" id="cards-banker">
                </div>
            </div>
            <div class="table">局ID:1123345</div>
            <div class="countdown">10</div>
        </div>`;
        // 闲家分数
        this.scorePlayer = this.querySelector('#score-player');
        // 庄家分数
        this.scoreBanker = this.querySelector('#score-banker');
        // 闲家牌
        this.cardPlayer = this.querySelector('#cards-player');
        // 庄家牌
        this.cardBanker = this.querySelector('#cards-banker');
        // 局ID
        this.tableId = this.querySelector('.table');
        // 倒计时
        this.countdown = this.querySelector('.countdown');
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
        this.timerId = Timer.interval(1000, () => {
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
}

customElements.define("deal-area", DealArea);