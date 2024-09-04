import { roundToDigits, writeToStderr } from './Utilities.js';
export class Timer {
    startTime = 0;
    constructor() {
        this.restart();
    }
    restart() {
        this.startTime = Timer.currentTime;
    }
    get elapsedTime() {
        // Elapsed time (milliseconds)
        return Timer.currentTime - this.startTime;
    }
    get elapsedTimeSeconds() {
        // Elapsed time (seconds)
        return this.elapsedTime / 1000;
    }
    getElapsedTimeAndRestart() {
        const elapsedTime = this.elapsedTime;
        this.restart();
        return elapsedTime;
    }
    logAndRestart(title, timePrecision = 3) {
        const elapsedTime = this.elapsedTime;
        //
        const message = `${title}: ${roundToDigits(elapsedTime, timePrecision)}ms`;
        writeToStderr(message);
        //
        this.restart();
        return elapsedTime;
    }
    static get currentTime() {
        if (!this.timestampFunc) {
            this.createGlobalTimestampFunction();
        }
        return this.timestampFunc();
    }
    static get microsecondTimestamp() {
        return Math.floor(Timer.currentTime * 1000);
    }
    static createGlobalTimestampFunction() {
        if (typeof process === 'object' && typeof process.hrtime === 'function') {
            let baseTimestamp = 0;
            this.timestampFunc = () => {
                const nodeTimeStamp = process.hrtime();
                const millisecondTime = (nodeTimeStamp[0] * 1000) + (nodeTimeStamp[1] / 1000000);
                return baseTimestamp + millisecondTime;
            };
            baseTimestamp = Date.now() - this.timestampFunc();
        }
        else if (typeof chrome === 'object' && chrome.Interval) {
            const baseTimestamp = Date.now();
            const chromeIntervalObject = new chrome.Interval();
            chromeIntervalObject.start();
            this.timestampFunc = () => baseTimestamp + chromeIntervalObject.microseconds() / 1000;
        }
        else if (typeof performance === 'object' && performance.now) {
            const baseTimestamp = Date.now() - performance.now();
            this.timestampFunc = () => baseTimestamp + performance.now();
        }
        else if (Date.now) {
            this.timestampFunc = () => Date.now();
        }
        else {
            this.timestampFunc = () => (new Date()).getTime();
        }
    }
    static timestampFunc;
}
//# sourceMappingURL=Timer.js.map