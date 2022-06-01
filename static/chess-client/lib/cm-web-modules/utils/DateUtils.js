/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

export class DateUtils {

    static diffInMs(from, to) {
        return to - from
    }

    static diffInSeconds(from, to) {
        return Math.floor((to - from) / 1000)
    }

    static diffInMinutes(from, to) {
        return Math.floor((to - from) / 60000)
    }

    static diffInHours(from, to) {
        return Math.floor((to - from) / 3600000)
    }

    static diffInDays(from, to) {
        return Math.floor((to - from) / 86400000)
    }

}