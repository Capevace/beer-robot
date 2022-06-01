/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

export class DomUtils {

    static documentReady(callback) {
        document.addEventListener("DOMContentLoaded", callback)
        if (document.readyState === "interactive" || document.readyState === "complete") {
            document.removeEventListener("DOMContentLoaded", callback)
            callback()
        }
    }

    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
    static isElementVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
    }

    // https://stackoverflow.com/questions/123999/how-can-i-tell-if-a-dom-element-is-visible-in-the-current-viewport
    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect()
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    static getFormInputValues(context) {
        const inputs = context.querySelectorAll("input,select")
        const values = {}
        inputs.forEach((input) => {
            if (input.type === "checkbox") {
                values[input.id] = !!input.checked
            } else {
                values[input.id] = input.value
            }
        })
        return values
    }

    static isBrowserDarkMode() {
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }

    static browserSupportsPreferredColorScheme() {
        return window.matchMedia &&
            (window.matchMedia('(prefers-color-scheme: dark)').matches ||
                window.matchMedia('(prefers-color-scheme: light)').matches)
    }

    static loadJs(src) {
        const element = document.createElement('script')
        element.setAttribute("type", "text/javascript")
        element.setAttribute("src", src)
        document.getElementsByTagName("head")[0].appendChild(element)
    }

    static loadCss(src) {
        const element = document.createElement("link")
        element.setAttribute("rel", "stylesheet")
        element.setAttribute("type", "text/css")
        element.setAttribute("href", src)
        document.getElementsByTagName("head")[0].appendChild(element)
    }

    static setCustomProperty(name, value, element = document.documentElement) {
        element.style.setProperty("--" + name, value.trim())
    }

    static getCustomProperty(name, element = document.documentElement) {
        return getComputedStyle(element).getPropertyValue('--' + name).trim()
    }

    static createElement(html) {
        const template = document.createElement('template')
        template.innerHTML = html.trim()
        return template.content.firstChild
    }

    static insertAfter(newChild, refChild) {
        refChild.parentNode.insertBefore(newChild, refChild.nextSibling)
    }

    static delegate(element, eventName, selector, handler) {
        const eventListener = function (event) {
            let target = event.target
            while (target && target !== this) {
                if (target.matches(selector)) {
                    handler.call(target, event)
                }
                target = target.parentNode
            }
        }
        element.addEventListener(eventName, eventListener)
        return {
            remove: function () {
                element.removeEventListener(eventName, eventListener)
            }
        }
    }

}
