/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

export class EncryptionUtils {

    static createKey(length = 10) {
        let key = ""
        const iterations = length / 10
        for (let i = 0; i < iterations; i++) {
            key += Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(36).substr(0, 10)
        }
        return key.substr(0, length)
    }

}