/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

import {Audio} from "./Audio.js"

export class Sample {

    constructor(src, props = {}) {
        this.src = src
        this.props = {
            gain: 1
        }
        Object.assign(this.props, props)
        this.gainNode = Audio.context().createGain()
        this.setGain(this.props.gain)
        this.audioBuffer = null
        this.load()
    }

    setGain(gain) {
        this.gainNode.gain.setValueAtTime(gain, Audio.context().currentTime)
    }

    play(when = undefined, offset = undefined, duration = undefined) {
        this.loading.then(() => {
            let source
            source = this.createBufferSource()
            source.start(when, offset, duration)
        })

    }

    createBufferSource() {
        const source = Audio.context().createBufferSource()
        source.buffer = this.audioBuffer
        source.connect(this.gainNode)
        this.gainNode.connect(Audio.destination())
        return source
    }

    load() {
        this.loading = new Promise(((resolve, reject) => {
            const request = new XMLHttpRequest()
            request.open('GET', this.src, true)
            request.responseType = 'arraybuffer'
            request.onload = () => {
                Audio.context().decodeAudioData(request.response, (audioBuffer) => {
                    this.audioBuffer = audioBuffer
                    resolve()
                }, () => {
                    console.error("error loading sound", this.src)
                    reject()
                })
            }
            request.send()
        }))
        return this.loading
    }

}