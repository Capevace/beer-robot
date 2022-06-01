/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */


export class Tag {

    constructor(context, name, props = {}) {
        this.props = {
            querySelector: "cm-" + name
        }
        Object.assign(this.props, props)
        this.context = context
        this.name = name
        this.elements = undefined
    }

    redraw() {
        this.elements = this.context.querySelectorAll(this.props.querySelector)
        this.preRedraw().then(() => {
            for (const element of this.elements) {
                element.innerHTML = this.render(element)
            }
            this.postRedraw()
        })
    }

    // API for child classes

    rawValue(element) {
        let rawValue = this.state(element).rawValue
        if(!rawValue) {
            rawValue = element.textContent
            this.state(element).rawValue = rawValue
        }
        return rawValue
    }

    state(element) {
        const propertyName = "TagState"
        if(!element[propertyName]) {
            element[propertyName] = {}
        }
        return element[propertyName]
    }

    // called after this.tagElements is filled
    // to fetch data
    preRedraw() {
        return Promise.resolve()
    }

    // called after all tags are drawn
    postRedraw() {
    }

    render(element) {
        return "[" + this.name + " " + this.rawValue(element) + "]";
    }
}