class SpeechManager {

    constructor() {
        this.queue = [];
        this.isPlaying = false;
        this.voices = [];
        this.lang = "zh-CN";

        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;

        this._initVoices();
    }

    // 初始化语音列表
    _initVoices() {
        const loadVoices = () => {
            this.voices = speechSynthesis.getVoices();
        };

        loadVoices();

        speechSynthesis.onvoiceschanged = loadVoices;
    }

    // 设置语言
    setLanguage(lang) {
        this.lang = lang;
    }

    // 设置参数
    setConfig({ rate, pitch, volume }) {

        if (rate !== undefined) this.rate = rate;
        if (pitch !== undefined) this.pitch = pitch;
        if (volume !== undefined) this.volume = volume;
    }

    // 获取语言语音
    _getVoice() {
        return this.voices.find(v => v.lang === this.lang) || null;
    }

    // 加入播报队列
    speak(text, priority = false) {
        if (priority) {
            this.stop();
            this.queue = [];
        }
        this.queue.push(text);
        this._playNext();
    }

    // 播放队列
    _playNext() {
        if (this.isPlaying) return;
        if (this.queue.length === 0) return;
        const text = this.queue.shift();
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = this._getVoice();
        utter.rate = this.rate;
        utter.pitch = this.pitch;
        utter.volume = this.volume;
        this.isPlaying = true;
        utter.onend = () => {
            this.isPlaying = false;
            this._playNext();
        };
        speechSynthesis.speak(utter);
    }

    // 停止播报
    stop() {
        speechSynthesis.cancel();
        this.isPlaying = false;
    }

    // 暂停
    pause() {
        speechSynthesis.pause();
    }

    // 继续
    resume() {
        speechSynthesis.resume();
    }
}

window.SpeechManager = new SpeechManager();


// SpeechManager.setConfig({
//     rate: 1,     // 语速
//     pitch: 1,    // 音调
//     volume: 1    // 音量
// });