/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

const additionalAttributes = "Path=/; SameSite=Strict;"

export const DURATION = {
    "second": 1,
    "minute": 60,
    "hour": 3600,
    "day": 86400,
    "week": 604800,
    "year": 31536000
}

export class Cookie {

    static write(name, value = "", maxAge = undefined) {
        let maxAgeAttribute = ""
        if (maxAge !== undefined) {
            maxAgeAttribute = "Max-Age=" + maxAge + "; "
        }
        document.cookie = name + "=" + value + "; " + maxAgeAttribute + additionalAttributes
    }

    static read(name) {
        const cookieAttributes = document.cookie.split(";")
        for (const cookieAttribute of cookieAttributes) {
            const cookieAttributeTrimmed = cookieAttribute.trim()
            const nameEquals = name + "="
            if (cookieAttributeTrimmed.indexOf(nameEquals) !== -1) {
                return cookieAttributeTrimmed.substr(nameEquals.length)
            }
        }
        return undefined
    }

    static delete(name) {
        this.write(name, "", 0)
    }

}