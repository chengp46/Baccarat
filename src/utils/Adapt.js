const DESIGN_W = 1080;
const DESIGN_H = 1920;

export function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function fixIOSHeight() {
    document.documentElement.style.setProperty(
        "--vh",
        window.innerHeight * 0.01 + "px"
    );
}

export function adaptGame() {
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
    game.style.transform = `translate(-50%, -50%) scale(${scale})`;
    fixIOSHeight();
}

/* ===== PC / 手机布局切换 ===== */
export function adaptLayout() {
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

// 或者更全面的解决方案
export function disableDoubleTapZoom() {
    let lastTouchTime = 0;

    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });

    document.addEventListener('touchend', function (event) {
        const now = new Date().getTime();
        if (now - lastTouchTime < 300) {
            event.preventDefault();
        }
        lastTouchTime = now;
    }, false);
}

// iOS Safari 特殊处理
export function disableIOSDoubleTap() {
    // 阻止触摸事件
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    // 阻止手势事件
    document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', function (event) {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', function (event) {
        event.preventDefault();
    }, { passive: false });
}
