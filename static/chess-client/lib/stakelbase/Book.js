
// Code dealing with Polyglot opening books
// Representation of a single entry in a Polyglot opening book

class BookEntry {

    // Build one BookEntry from the binary data slurped from
    // a polyglot opening book starting at byte-offset 'ofs'
    constructor(bookdata, ofs) {
        // Remember where we started from
        // noinspection JSUnusedGlobalSymbols
        this.ofs = ofs
        // Convert key to BigInt (64-bit) value
        let key = BigInt(0)
        let i
        let byt
        for (i = 0; i < 8; ++i) {
            byt = bookdata.charCodeAt(ofs++)
            key = (key << BigInt(8)) | BigInt(byt)
        }
        this.key = key
        let raw_move = 0
        for (i = 0; i < 2; ++i) {
            byt = bookdata.charCodeAt(ofs++)
            raw_move = (raw_move << 8) | byt
        }
        this.raw_move = raw_move
        let weight = 0
        for (i = 0; i < 2; ++i) {
            byt = bookdata.charCodeAt(ofs++)
            weight = (weight << 8) | byt
        }
        this.weight = weight
        let learn = 0
        for (i = 0; i < 4; ++i) {
            byt = bookdata.charCodeAt(ofs++)
            learn = (learn << 8) | byt
        }
        // noinspection JSUnusedGlobalSymbols
        this.learn = learn
    }

    get_key() {
        return this.key
    }

    get_from_row() {
        return (this.raw_move >> 9) & 0x0007
    }

    get_from_col() {
        return (this.raw_move >> 6) & 0x0007
    }

    get_to_row() {
        return (this.raw_move >> 3) & 0x0007
    }

    get_to_col() {
        return this.raw_move & 0x0007
    }

    get_promo_piece() {
        return (this.raw_move >> 12) & 0x0007
    }

    // Polyglot uses its own convention for castling: provide
    // accessor methods for finding out which type of castling
    // is encoded in current move.
    isOOW() {
        return this.raw_move === 0x0107
    }

    isOOB() {
        return this.raw_move === 0x0f3f
    }

    isOOOW() {
        return this.raw_move === 0x0100
    }

    isOOOB() {
        return this.raw_move === 0x0f38
    }

}

// representation of a Polyglot binary opening book
export class Book {

    constructor(bookdata) {
        this.bookdata = bookdata
        this.cache = []	// cache so that we parse each entry at most one time
        if (this.bookdata.length >= 32) {
            this.first = new BookEntry(this.bookdata, 0)
            this.last = new BookEntry(this.bookdata, this.get_last_index())
        } else {
            this.first = null
            this.last = null
        }
    }

    get_length() {
        return this.bookdata.length / 16
    }

    get_last_index() {
        return this.get_length() - 1
    }

    get_offset(idx) {
        return idx * 16
    }

    get_entry(idx) {
        let e
        if (this.cache[idx] === undefined) {
            e = new BookEntry(this.bookdata, this.get_offset(idx))
            this.cache[idx] = e
        } else {
            e = this.cache[idx]
        }
        return e
    }

    // Retrieve the index of the first occurrence of the specified hash,
    // or -1 if not found.
    //
    // weed = BigInt (64-bit integer) with the hash to locate
    find_first_hash(weed) {
        if (this.first === null || this.last === null) {
            return -1
        }
        if (weed < this.first || weed > this.last) {
            return -1
        }
        if (weed === this.first) {
            return 0
        }
        let i0 = 0
        let i1 = (this.bookdata.length / 16) - 1
        let i = i1
        let ky = 0n	// need a BigInt here
        // If the last entry matches the searched hash value,
        // we can skip the binary search and go straight to
        // the part where we move up in the list of same hash
        // values until we find the first in the list.
        if (weed !== this.last) {
            // Stop looping if only 2 elements are in the inspection range:
            // both endpoints will have been compared to the wanted hash value
            // and both endpoints of the range will have a different hash. So,
            // if there are only two left, and both have previously been confirmed
            // to be different from the wanted hash, that means that the hash is
            // not in the table and we can safely bail out of the loop.
            while (i1 - i0 > 1) {
                i = Math.floor((i0 + i1) / 2)	// this is javascript for you: no int arithmetic
                const e = this.get_entry(i)
                ky = e.get_key()
                if (ky === weed) {
                    // Found an entry with the wanted hash: stop looping
                    break
                }
                // Not found, so continue with half the current range
                if (ky < weed) {
                    i0 = i
                } else {
                    i1 = i
                }
            }
        }
        // No need to go up in the table if not found
        if (ky !== weed) {
            return -1
        }
        // Move up in table until different key found
        while (i > 0) {
            if (this.get_entry(i - 1).get_key() === weed) {
                i = i - 1
            } else {
                break
            }
        }
        return i
    }

    // Get all entries for given hash
    get_all_moves(weed) {
        let i = this.find_first_hash(weed)
        if (i < 0) {
            return []
        }
        const lst = []
        let e = this.get_entry(i)
        while ((e !== undefined) && (e.get_key() === weed)) {
            lst.push(e)
            e = this.get_entry(++i)
        }
        return lst
    }

}
