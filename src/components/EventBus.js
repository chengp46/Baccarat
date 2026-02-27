export class EventBus {

    constructor() {
        this.events = {};
    }

    on(event, cb) {
        if (!this.events[event]) {
            this.events[event] = new Set();
        }
        this.events[event].add(cb);
    }

    off(event, cb) {
        this.events[event]?.delete(cb);
    }

    emit(event, data) {
        console.log("[Event]", event, data);
        this.events[event]?.forEach(cb => cb(data));
    }

    once(event, cb) {
        const fn = (data) => {
            cb(data);
            this.off(event, fn);
        };
        this.on(event, fn);
    }
}

// ⭐ 全局单例
window.UIBus = new EventBus();
