/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

export class ArrayUtils {
    static pushAll(fromArray, toArray) {
        for (let obj of fromArray) {
            toArray.push(obj);
        }
    }
    static unshiftAll(fromArray, toArray) {
        for (let obj of fromArray) {
            toArray.unshift(obj);
        }
    }
}