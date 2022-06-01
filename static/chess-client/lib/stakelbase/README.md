# Stakelbase

Stakelbase is a viewer for Polyglot binary chess opening books.

Git Repository: https://github.com/evilwan/stakelbase

## What does it do for me?

The tool lets you select any binary Polyglot chess opening book and then allows to browse
through the variations stored in that book. In each position, a list of registered continuations
from that position is shown. Click (select) one variation and the alternatives for the next move
are shown.

The list of variations is sorted in descending order of the weights in the opening book, so the
move with the highest score is shown first.

## Usage

Download all the files in this repository in the same local directory. Next open testsb.html in a web browser (with Javascript enabled) That's it.

## Quick introduction of the tool

After loading the interface, the first thing to do is to load a binary opening book from file (usually with extension .bin)
Such opening books can be downloaded from the Internet. Many tools (e.g. SCID) come with one or more
opening books in this format. Finally, it is possible (advisable?) to create new books with the polyglot command line tool.
That tool can be found on the web (a fork can be found here: https://github.com/evilwan/polyglot)

Once loaded, the interface will show a list of possible continuations: click on the variation of your choice. That move
will be performed on the chess board and the list of variations is refreshed with the know continuations from the new
board position. Repeat the process until no more continations are shown: you have reached the end of that variation in the book.

The arrow keys on the bottom of the screen can be used to go back and forth in the moves (e.g. to go back and select a different continuation)

The button with label "|<" returns to the start of the game (initial board position).

The button with label ">|" will advance in the current variation until either out of book, or when the book contains
more than one continuation.

The rotate board button does exactly that: flip the board.

## Why HTML and Javascript?

This tool is intended to be used on as many platforms as possible, preferably requiring only a web browser (think Android devices and chromebooks)

As such, one of the design goals was to keep it simple and self-contained, so no external dependencies (no jquery, no node.js ...)

In the end, it is perfectly possible to merge all Javascript code in one big file, or maybe even include it as inline Javascript code
in the HTML page.

## Why this name?

The name is derived from the Dutch word "stekelbees", which translates to English as "gooseberry".

In Dutch, "stekels" means thorns or sharp branches, which looked appropriate for handling all the various
continuation lines that can arise from chess positions. The second part, "bees" is pronounced like the English
word "base", which seems applicable to everything chess database related.

## License

This tool is released under the BSD 3 clauses license: see LICENSE file.
