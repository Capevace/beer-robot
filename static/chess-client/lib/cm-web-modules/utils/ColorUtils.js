/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */

/*
From
    - https://css-tricks.com/converting-color-spaces-in-javascript/ and
    - https://gist.github.com/mjackson/5311256
 */

export class ColorUtils {

    static rgbToHex(r, g, b) {
        if (typeof r === 'object' && !g && !b) {
            b = r.b.toString(16)
            g = r.g.toString(16)
            r = r.r.toString(16)
        } else {
            r = r.toString(16)
            g = g.toString(16)
            b = b.toString(16)
        }
        if (r.length === 1)
            r = "0" + r
        if (g.length === 1)
            g = "0" + g
        if (b.length === 1)
            b = "0" + b
        return "#" + r + g + b
    }

    static hexToRgb(hex) {
        let r = 0, g = 0, b = 0
        if (hex.length === 4) {
            r = hex[1] + hex[1]
            g = hex[2] + hex[2]
            b = hex[3] + hex[3]
        } else if (hex.length === 7) {
            r = hex[1] + hex[2]
            g = hex[3] + hex[4]
            b = hex[5] + hex[6]
        }
        return {
            r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16)
        }
    }

    static rgbToHsl(r, g, b) {
        if (typeof r === 'object' && !g && !b) {
            b = r.b
            g = r.g
            r = r.r
        }
        r /= 255
        g /= 255
        b /= 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        let h, s, l = (max + min) / 2
        if (max === min) {
            h = s = 0 // achromatic
        } else {
            var d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0)
                    break
                case g:
                    h = (b - r) / d + 2
                    break
                case b:
                    h = (r - g) / d + 4
                    break
            }
            h /= 6
        }
        return {h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100)}
    }

    static hslToRgb(h, s, l) {
        if (typeof h === 'object' && !s && !l) {
            l = h.l
            s = h.s
            h = h.h
        }
        // Must be fractions of 1
        s /= 100
        l /= 100
        h = h % 360
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0
        if (0 <= h && h < 60) {
            r = c
            g = x
            b = 0
        } else if (60 <= h && h < 120) {
            r = x
            g = c
            b = 0
        } else if (120 <= h && h < 180) {
            r = 0
            g = c
            b = x
        } else if (180 <= h && h < 240) {
            r = 0
            g = x
            b = c
        } else if (240 <= h && h < 300) {
            r = x
            g = 0
            b = c
        } else if (300 <= h && h < 360) {
            r = c
            g = 0
            b = x
        }
        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)
        return {r: r, g: g, b: b}
    }

    static hslToHex(h, s, l) {
        return this.rgbToHex(this.hslToRgb(h, s, l))
    }

    static hexToHsl(hex) {
        return this.rgbToHsl(this.hexToRgb(hex))
    }

}