/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

import {DomUtils} from "./DomUtils.js"

export class EventUtils {

    static delegate(element, eventName, selector, handler) {
        console.warn("EventUtils is deprecated, use DomUtils")
        return DomUtils.delegate(element, eventName, selector, handler)
    }

}