export class FunctionArea extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="func-area">
                <button data-id="1" class="func-button">信息</button>
                <button data-id="2" class="func-button">设置</button>
                <button data-id="3" class="func-button">报表</button>
                <button data-id="4" class="func-button">验证</button>
            </div>
        `;

        this.querySelectorAll(".func-button").forEach(btn => {
            // 处理桌面端点击
            btn.addEventListener("mousedown", () => {
                btn.classList.add('active');
                UIBus.emit("func-click", {
                    id: btn.dataset.id
                });
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
                btn.classList.remove('hover');
                // 触发点击事件
                UIBus.emit("func-click", {
                    id: btn.dataset.id
                });
            });
            btn.addEventListener("touchcancel", (e) => {
                e.preventDefault();
                btn.classList.remove('active');
                btn.classList.remove('hover');
            });

        });
    }

    showInfo() {
        console.log("qw.............");
    }
}

customElements.define("function-area", FunctionArea);