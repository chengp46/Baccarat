class AudioChannel {

    constructor(audio) {
        this.audio = audio;
    }

    play(loop = false) {
        this.audio.loop = loop;
        this.audio.currentTime = 0;
        this.audio.play();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    pause() {
        this.audio.pause();
    }

    resume() {
        this.audio.play();
    }

    setVolume(v) {
        this.audio.volume = v;
    }
}


export class AudioManager {

    constructor() {
        this.cache = new Map();
        this.bgm = null;
        this.bgmVolume = 1;
        this.sfxVolume = 1;
        this.muted = false;
    }

    // =====================
    // 加载音频
    // =====================

    load(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        const audio = new Audio(url);
        audio.preload = "auto";
        this.cache.set(url, audio);
        return audio;
    }


    // =====================
    // BGM
    // =====================

    playBGM(url, loop = true) {
        if (this.bgm) {
            this.bgm.stop();
        }
        const audio = this.load(url).cloneNode();
        audio.volume = this.bgmVolume;
        this.bgm = new AudioChannel(audio);
        if (!this.muted)
            this.bgm.play(loop);
    }

    stopBGM() {
        this.bgm?.stop();
        this.bgm = null;
    }

    setBGMVolume(v) {
        this.bgmVolume = v;
        if (this.bgm) this.bgm.setVolume(v);
    }


    // =====================
    // 音效
    // =====================

    playSFX(url) {
        if (this.muted) return;
        const audio = this.load(url).cloneNode();
        audio.volume = this.sfxVolume;
        audio.play();
    }

    setSFXVolume(v) {
        this.sfxVolume = v;
    }

    // =====================
    // 淡入淡出
    // =====================

    fadeBGM(targetVolume, duration = 1000) {
        if (!this.bgm) return;
        const start = this.bgm.audio.volume;
        const diff = targetVolume - start;
        let startTime = performance.now();
        const loop = (now) => {
            let t = (now - startTime) / duration;
            if (t > 1) t = 1;
            let v = start + diff * t;
            this.bgm.setVolume(v);
            if (t < 1) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // =====================
    // 全局控制
    // =====================
    mute() {
        this.muted = true;
        this.bgm?.pause();
    }

    unmute() {
        this.muted = false;
        this.bgm?.resume();
    }
}

// =====================
// 全局实例
// =====================
export const AudioMgr = new AudioManager();

/*
//1. 背景音乐 BGM
//播放
AudioMgr.playBGM("assets/bgm.mp3");
//停止
AudioMgr.stopBGM();
//调整音量
AudioMgr.setBGMVolume(0.5);
//2. 音效播放 SFX
AudioMgr.playSFX("assets/click.mp3");
// 👉 支持并发播放
// 👉 每次都会 clone 音频节点
// 👉 不会打断
//✅ 3. 音量控制
AudioMgr.setSFXVolume(0.6);
//✅ 4. 淡入淡出（游戏非常常用）
//渐弱
AudioMgr.fadeBGM(0, 2000);
//渐强
AudioMgr.fadeBGM(1, 2000);
//5. 全局静音
AudioMgr.mute();
AudioMgr.unmute();
*/