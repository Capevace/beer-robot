/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */
import {DateUtils} from "../utils/DateUtils.js"

export class Stopwatch {

    constructor(props = {}) {
        this.props = {
            onStateChanged: () => {}, // callback an start and stop
            onTimeChanged: () => {}, // callback, to read out the time value, called every `tickResolution` ms
            tickResolution: 100 // milliseconds of the time resolution
        }
        Object.assign(this.props, props)
        this.startDate = null
        this.endDate = null
        this.dateAtLatestStart = null
        this.secondsExpiredTillLastPause = 0.0
        this.secondsExpiredSinceLastStart = 0.0
        this.timer = null
    }

    secondsExpired() {
        return this.secondsExpiredTillLastPause + this.secondsExpiredSinceLastStart
    }

    start() {
        if (this.secondsExpired() === 0) {
            this.startDate = new Date()
        }
        if (!this.running()) {
            this.secondsExpiredSinceLastStart = 0
            this.dateAtLatestStart = new Date()
            this.timer = setInterval(() => {
                this.tick()
            }, this.props.tickResolution)
            this.props.onStateChanged(this.running())
            this.props.onTimeChanged(this.secondsExpiredTillLastPause)
        }
    }

    stop() {
        if (this.running()) {
            clearInterval(this.timer)
            this.timer = null
            this.endDate = new Date()
            this.secondsExpiredTillLastPause = this.secondsExpired()
            this.secondsExpiredSinceLastStart = 0
            this.props.onStateChanged(this.running())
        }
    }

    reset() {
        this.secondsExpiredSinceLastStart = 0
        this.secondsExpiredTillLastPause = 0
        this.startDate = new Date()
        this.dateAtLatestStart = new Date()
        this.props.onTimeChanged(this.secondsExpired())
        this.props.onStateChanged(this.running())

    }

    tick() {
        const newSecondsExpired = (DateUtils.diffInMs(this.dateAtLatestStart.getTime(), new Date().getTime()) / 1000)
        if (newSecondsExpired !== this.secondsExpiredSinceLastStart) {
            this.secondsExpiredSinceLastStart = newSecondsExpired
            this.props.onTimeChanged(this.secondsExpired())
        }
    }

    running() {
        return this.timer != null
    }
}