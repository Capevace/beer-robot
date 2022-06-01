// noinspection JSUnresolvedVariable
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */
window.AudioContext = window.AudioContext || window.webkitAudioContext

const desiredSampleRate = 44100
// ios safari fix from https://github.com/Jam3/ios-safe-audio-context
let audioContext = new AudioContext()
const mainGainNode = audioContext.createGain()
mainGainNode.gain.value = 1
mainGainNode.connect(audioContext.destination)
if (/(iPhone|iPad)/i.test(navigator.userAgent) && audioContext.sampleRate !== desiredSampleRate) {
    const buffer = audioContext.createBuffer(1, 1, desiredSampleRate)
    const sound = audioContext.createBufferSource()
    sound.buffer = buffer
    sound.connect(audioContext.destination)
    sound.start(0)
    sound.disconnect()
    audioContext.close().then(() => {
        audioContext = new AudioContext()
        mainGainNode.connect(audioContext.destination)
    })
}
// start context after user interaction
const resumeAudio = function () {
    if (audioContext.state !== "running") {
        document.removeEventListener("mousedown", resumeAudio)
        return audioContext.resume()
    }
}
document.addEventListener("mousedown", resumeAudio)

export class Audio {

    static context() {
        return audioContext
    }

    static destination() {
        return mainGainNode
    }

    static setGain(gain) {
        mainGainNode.gain.setValueAtTime(gain, audioContext.currentTime)
    }

}