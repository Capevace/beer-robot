/**
 * Author: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-polyglot
 * License: MIT, see file "LINCENSE"
 *
 * An ES6 wrapper for the ployglot part of https://github.com/evilwan/stakelbase
 */

import {Book} from "../stakelbase/Book.js"
import {KeyGenerator} from "../stakelbase/KeyGenerator.js"

export class Polyglot {

    constructor(url) {
        // const bookEntry = new BookEntry()
        this.book = null
        this.initialisation = new Promise((resolve) => {
            /** @var book Book */
            this.fetchBook(url).then((book) => {
                this.book = book
                resolve()
            })
        })
        this.keyGenerator = new KeyGenerator()
    }

    /**
        @returns move { from: 'h7', to:'h8', promotion: 'q' }
     */
    entryToMove(bookEntry) {
        const move = {
            from: undefined,
            to: undefined,
            promotion: undefined
        }
        const files = "abcdefgh"
        const promoPieces = " nbrq"

        move.from = files[bookEntry.get_from_col()]
        move.from = "" + move.from + (bookEntry.get_from_row() + 1)
        move.to = files[bookEntry.get_to_col()]
        move.to = "" + move.to + (bookEntry.get_to_row() + 1)

        if (bookEntry.get_promo_piece() > 0) {
            move.promotion = promoPieces[bookEntry.get_promo_piece()]
        }
        // special castling moves notation in polyglot, see http://hgm.nubati.net/book_format.html
        if(bookEntry.isOOW()) {
            move.to = "g1"
        } else if(bookEntry.isOOOW()) {
            move.to = "c1"
        } else if(bookEntry.isOOB()) {
            move.to = "g8"
        } else if(bookEntry.isOOOB()) {
            move.to = "c8"
        }
        move.weight = bookEntry.weight
        return move
    }

    async getMovesFromFen(fen, weightPower = 0.2) {
        return new Promise((resolve) => {
            this.initialisation.then(() => {
                const hash = this.keyGenerator.compute_fen_hash(fen)
                const bookEntries = this.book.get_all_moves(hash)
                const moves = []
                let weightSum = 0
                for (const bookEntry of bookEntries) {
                    moves.push(this.entryToMove(bookEntry))
                    weightSum += bookEntry.weight
                }
                // calculate probability  http://hgm.nubati.net/book_format.html
                for (const move of moves) {
                    move.probability = Math.pow(move.weight / weightSum, weightPower)
                        .toFixed(1)
                }
                resolve(moves)
            })
        })
    }

    fetchBook(url) {
        return new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                response.blob().then((blob) => {
                    let reader = new FileReader()
                    reader.readAsBinaryString(blob)
                    reader.onload = () => {
                        resolve(new Book(reader.result))
                    }
                    reader.onerror = () => {
                        reject(reader.error)
                    }
                })
            })
        })
    }

}

