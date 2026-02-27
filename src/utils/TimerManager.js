class TimerTask {

    constructor(options) {
        this.delay = options.delay || 0;
        this.interval = options.interval || 0;
        this.repeat = options.repeat ?? -1;
        this.callback = options.callback;
        this.elapsed = 0;
        this.running = true;
        this.group = options.group || "default";
        this.id = TimerTask._id++;
    }

    update(dt) {
        if (!this.running) {
            return false;
        }
        this.elapsed += dt;
        if (this.elapsed < this.delay) {
            return false;
        }

        if (this.interval === 0) {
            this.callback?.();
            return true;
        }
        if (this.elapsed >= this.delay + this.interval) {
            this.elapsed -= this.interval;
            this.callback?.();
            if (this.repeat > 0) {
                this.repeat--;
                if (this.repeat === 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

TimerTask._id = 1;


export class TimerManager {

    constructor() {
        this.tasks = [];
        this.running = false;
        this.timeScale = 1;
        this.lastTime = 0;
        this.pausedGroups = new Set();
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
        return new Promise(resolve => {
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
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    clearGroup(group) {
        this.tasks = this.tasks.filter(t => t.group !== group);
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
}

// =====================
// Global Singleton
// =====================
export const Timer = new TimerManager();
Timer.start();

// =====================
// Helper Shortcut
// =====================
export function wait(ms) {
    return Timer.wait(ms);
}

/*
//1. 单次定时器
Timer.once(1000, () => {
    console.log("1秒后执行");
});
//✅ 2. 循环定时器
Timer.interval(500, () => {
    console.log("每0.5秒执行");
});
//✅ 3. 指定循环次数
Timer.interval(500, () => {
    console.log("执行3次");
}, 3);
//✅ 4. 帧定时器（游戏核心）类似 Cocos update()
Timer.frame((dt) => {
    console.log("每帧执行");
});
//✅ 5. Promise等待（现代写法 ⭐）
await Timer.wait(1000);
console.log("1秒后继续执行");
// 创建带分组定时器
Timer.interval(1000, updateUI, -1, "ui");
Timer.interval(16, updateGame, -1, "game");
//暂停某一类系统
Timer.pauseGroup("game");
//恢复
Timer.resumeGroup("game");
//清空分组
Timer.clearGroup("ui"); */