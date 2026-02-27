// =========================
// Ease System
// =========================
export const Ease = {
    linear: t => t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutQuad: t =>
        t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2,
    outBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    // 弹性动画
    elastic: (t, amplitude = 1, period = 0.3) => {
        if (t === 0 || t === 1) return t;
        return (
            amplitude *
            Math.pow(2, -10 * t) *
            Math.sin((t - period / 4) * (2 * Math.PI) / period) +
            1
        );
    },
    // 反弹动画
    bounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        }
        else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        }
        else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        }
        else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    // 真实弹簧（物理模型 ⭐）
    spring: (t, mass = 1, stiffness = 100, damping = 10, velocity = 0) => {
        const w0 = Math.sqrt(stiffness / mass);
        const zeta = damping / (2 * Math.sqrt(stiffness * mass));
        const wd = w0 * Math.sqrt(1 - zeta * zeta);
        if (zeta < 1) {
            const A = 1;
            const B = (zeta * w0 - velocity) / wd;
            return 1 - Math.exp(-zeta * w0 * t) *
                (A * Math.cos(wd * t) + B * Math.sin(wd * t));
        } else {
            return 1 - Math.exp(-w0 * t);
        }
    }
};

export function registerEase(name, fn) {
    Ease[name] = fn;
}


// =========================
// Transform Cache
// =========================
function getTransform(target) {
    if (!target._transform) {
        target._transform = {
            x: 0, y: 0,
            scale: 1, rotate: 0
        };
    }
    return target._transform;
}

function applyTransform(target) {
    const t = getTransform(target);
    target.style.transform =
        `translate(${t.x}px, ${t.y}px) ` +
        `scale(${t.scale}) ` +
        `rotate(${t.rotate}deg)`;
}


/* =========================
// Tween Engine
x , y , scale, rotate, opacity
// =========================*/
export class Tween {

    constructor(target) {
        this.target = target;
        this.queue = [];
        this._paused = false;
        this._stopped = false;
        this._repeat = 0;
    }


    // ===== Timeline =====
    to(props, duration = 300, ease = Ease.linear) {
        this.queue.push({
            type: "to",
            props,
            duration,
            ease,
            relative: false
        });
        return this;
    }

    by(props, duration = 300, ease = Ease.linear) {
        this.queue.push({
            type: "to",
            props,
            duration,
            ease,
            relative: true
        });
        return this;
    }

    elasticTo(props, duration = 600, amplitude = 1, period = 0.3) {
        return this.to(
            props,
            duration,
            t => Ease.elastic(t, amplitude, period)
        );
    }

    bounceTo(props, duration = 600) {
        return this.to(props, duration, Ease.bounce);
    }

    springTo(props, duration = 600, config = {}) {
        const {
            mass = 1,
            stiffness = 100,
            damping = 10,
            velocity = 0
        } = config;
        return this.to(
            props,
            duration,
            t => Ease.spring(t, mass, stiffness, damping, velocity)
        );
    }

    delay(time) {
        this.queue.push({ type: "delay", time });
        return this;
    }

    call(fn) {
        this.queue.push({ type: "call", fn });
        return this;
    }

    parallel(...tweens) {
        this.queue.push({ type: "parallel", tweens });
        return this;
    }

    repeat(count) {
        this._repeat = count;
        return this;
    }


    // ===== Control =====
    pause() {
        this._paused = true;
    }

    resume() {
        this._paused = false;
    }

    stop() {
        this._stopped = true;
    }


    // ===== Start =====
    async start() {
        let loop = this._repeat + 1;
        while (loop > 0 && !this._stopped) {
            for (let item of this.queue) {
                if (this._stopped) return;
                if (item.type === "to") {
                    await this._runTo(item);
                }
                else if (item.type === "delay") {
                    await this._delay(item.time);
                }
                else if (item.type === "call") {
                    item.fn && item.fn();
                }
                else if (item.type === "parallel") {
                    await Promise.all(item.tweens.map(t => t.start()));
                }
            }
            loop--;
        }
    }


    // =========================
    // Internal
    // =========================
    _delay(time) {
        return new Promise(r => setTimeout(r, time));
    }

    async _runTo(item) {
        return new Promise(resolve => {
            const startTime = performance.now();
            const startValue = {};
            const endValue = {};
            for (let key in item.props) {
                let from = this._getValue(key);
                let to = item.props[key];
                startValue[key] = from;
                endValue[key] = item.relative ? from + to : to;
            }

            const loop = (now) => {
                if (this._stopped) return;
                if (this._paused) {
                    requestAnimationFrame(loop);
                    return;
                }

                let t = (now - startTime) / item.duration;
                if (t > 1) t = 1;
                let ratio = item.ease(t);
                for (let key in endValue) {
                    let from = startValue[key];
                    let to = endValue[key];
                    let value = from + (to - from) * ratio;
                    this._setValue(key, value);
                }

                if (t < 1) {
                    requestAnimationFrame(loop);
                }
                else {
                    resolve();
                }
            };

            requestAnimationFrame(loop);
        });
    }

    _getValue(key) {
        if (key === "opacity") {
            return parseFloat(getComputedStyle(this.target).opacity) || 0;
        }
        const t = getTransform(this.target);
        if (key in t) return t[key];
        return 0;
    }

    _setValue(key, value) {
        if (key === "opacity") {
            this.target.style.opacity = value;
            return;
        }
        const t = getTransform(this.target);
        if (key in t) {
            t[key] = value;
            applyTransform(this.target);
        }
        else {
            this.target.style[key] = value + "px";
        }
    }
}


// =========================
// Helper Shortcut
// =========================
export function tween(target) {
    return new Tween(target);
}
