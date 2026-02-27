class PopupBase {

    constructor(node) {
        this.node = node;
        this.mask = null;
        this.modal = true;
        this.group = "default";
        this.zIndex = 0;
    }

    onOpen(data) { }
    onClose() { }
}


export class PopupManager {

    constructor(root) {
        this.root = root;
        this.stack = [];
        this.queue = [];
        this.baseZ = 1000;
    }


    // =====================
    // Create Mask
    // =====================
    _createMask(z) {
        let mask = document.createElement("div");
        mask.style.position = "absolute";
        mask.style.left = 0;
        mask.style.top = 0;
        mask.style.width = "100%";
        mask.style.height = "100%";
        mask.style.background = "rgba(0,0,0,0.5)";
        mask.style.zIndex = z;
        return mask;
    }


    // =====================
    // Open Popup
    // =====================
    open(PopupClass, options = {}) {
        return new Promise(resolve => {
            let node = new PopupClass();
            let popup = new PopupBase(node);
            popup.modal = options.modal ?? true;
            popup.group = options.group ?? "default";
            let z = this.baseZ + this.stack.length * 2;
            popup.zIndex = z + 1;
            if (popup.modal) {
                popup.mask = this._createMask(z);
                this.root.appendChild(popup.mask);
                popup.mask.onclick = () => {
                    if (options.clickMaskClose) {
                        this.close(node);
                    }
                };
            }
            node.style.position = "absolute";
            node.style.zIndex = popup.zIndex;
            this.root.appendChild(node);
            this._playOpenAnim(node);
            this.stack.push({ popup, resolve });
            popup.onOpen(options.data);
        });
    }


    // =====================
    // Close Popup
    // =====================
    close(node, result) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let item = this.stack[i];
            if (item.popup.node === node) {
                let { popup, resolve } = item;
                popup.onClose();
                this._playCloseAnim(node, () => {
                    node.remove();
                    if (popup.mask) {
                        popup.mask.remove();
                    }
                    resolve(result);
                });

                this.stack.splice(i, 1);
                break;
            }
        }
    }


    // =====================
    // Close All
    // =====================
    closeAll() {
        while (this.stack.length > 0) {
            this.close(this.stack[this.stack.length - 1].popup.node);
        }
    }


    // =====================
    // Animation
    // =====================
    _playOpenAnim(node) {
        node.style.transform = "scale(0.7)";
        node.style.opacity = 0;
        requestAnimationFrame(() => {
            node.style.transition = "all 0.25s ease";
            node.style.transform = "scale(1)";
            node.style.opacity = 1;
        });
    }


    _playCloseAnim(node, cb) {
        node.style.transform = "scale(0.7)";
        node.style.opacity = 0;
        setTimeout(cb, 250);
    }
}

// =====================
// Singleton
// =====================
export const Popup = new PopupManager(document.body);


// =====================
// Example Popup
// =====================
export class ConfirmPopup extends HTMLElement {

    constructor() {
        super();

        this.innerHTML = `
        <div style="
            width:300px;
            height:180px;
            background:#fff;
            border-radius:12px;
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%, -50%);
            padding:20px;
        ">
            <h3>Confirm</h3>
            <button id="okBtn">OK</button>
            <button id="cancelBtn">Cancel</button>
        </div>
        `;
    }

    connectedCallback() {

        this.querySelector("#okBtn").onclick = () => {
            Popup.close(this, true);
        };

        this.querySelector("#cancelBtn").onclick = () => {
            Popup.close(this, false);
        };
    }
}

customElements.define("confirm-popup", ConfirmPopup);

/*
let result = await Popup.open(ConfirmPopup);
if(result){
    console.log("点击确定");
} 
    */