/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2021-06-09
 */

export class Template {
    constructor(templateOrContent) {
        if(templateOrContent instanceof HTMLElement) {
            this.content = ""
            for (const childNode of templateOrContent.content.childNodes) {
                if(childNode.nodeType === Node.TEXT_NODE) {
                    this.content += childNode.wholeText
                } else if(childNode.nodeType === Node.ELEMENT_NODE) {
                    this.content += childNode.outerHTML
                }
            }
        } else if (typeof templateOrContent === 'string' || templateOrContent instanceof String) {
            this.content = templateOrContent
        }
    }

    render(replacements) {
        return this.content.replace(/\${(.*?)}/g, (toReplace, key) => {
            if(replacements[key] === undefined) {
                return toReplace
            } else {
                return replacements[key]
            }
        })
    }
}
