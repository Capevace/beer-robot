/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-engine-runner
 * License: MIT, see file 'LICENSE'
 */

export const ENGINE_STATE = {
    LOADING: 1,
    LOADED: 2,
    READY: 3,
    THINKING: 4
}

export class EngineRunner {

    constructor(props) {
        this.props = {
            debug: false,
            responseDelay: 1000  // https://www.reddit.com/r/ProgrammerHumor/comments/6xwely/from_the_apple_chess_engine_code/
                                 // https://opensource.apple.com/source/Chess/Chess-347/Sources/MBCEngine.mm.auto.html
        }
        Object.assign(this.props, props)
        this.engineState = ENGINE_STATE.LOADING
        this.initialization = this.init()
    }

    init() {
        return Promise.reject("you have to implement `init()` in the EngineRunner")
    }

    calculateMove(fen, props = {}) {

    }

}