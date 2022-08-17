/*
 * A stack-machine based Example syntax parser.
 *
 * Spec:
 * 
 *     A text is considered a named fragment when it is located between
 *     "// BEGIN FRAGMENT: <name>" and "// END FRAGMENT", <> not included.
 *     This syntax is case-sensitive.
 * 
 *     Don't use special characters in names. Prefer snake case.
 * 
 *     Fragments can be included in one another.
 *     In that case the lines matching
 *     "// BEGIN FRAGMENT: " and "// END FRAGMENT" are removed.
 *     Elements between "// BEGIN ESCAPE" and "// END ESCAPE"
 *     are excluded unconditionally from the tutorial.
 * 
 * Example code:
 * 
 *     ```ts
 *     import { ExampleParser } from "./example_parser"
 *     let text: string = "// BEGIN FRAGMENT: test\nHello.\n// END FRAGMENT"
 *     let parser_inst: ExampleParser = new ExampleParser(text)
 *     console.log(parser_inst.mapLines())
 *     ```
 */

// A custom error type to be used with broken syntax
export class ExampleSyntaxError extends Error {
    constructor(message:string = '') {
      super(message)
      this.message = message
    }
}

// Obtain a range of numbers as an array, including the end
let range = function(start: number, end: number): Array<number> {
    let src: Array<number> = Array.from(Array(end - start + 1).keys())
    return src.map(x => x + start)
}

// Check if the string is empty or contains
// only the space and tabulation characters
function emptySpace(str: string) {
    return str.trim().length === 0
}

// Remove empty strings at both start and end
// in an array of lines
export function trimEmptyLines(lines: Array<string>) {
    // Remove the first and the last string if those are
    // filled with spaces or empty
    while (emptySpace(lines.at(0) || '')) lines.shift()
    while (emptySpace(lines.at(-1) || '')) lines.pop()
    return lines
}

// Clear line indentation for an array of strings containing the lines
let clearIndentation = function(lines: Array<string>) {
    // Calculate a padding common for all the lines
    let commonIndent: number = getCommonStartPadding(lines)
    // Return the lines with a common indentation removed
    return lines.map(
        line => {return line.slice(commonIndent) }
    )
}

// Checks if whitespaces and tabs of a given prefix length are equal for all provided lines
function spaceSectionEquals(lines: Array<string>, prefixLen: number) {
    let prefixes = lines.map(line => {return line.slice(0, prefixLen)})
    let prefixIsTrimmable = lines[0].slice(0, prefixLen).trim().length === 0
    let prefixesAreEqual = prefixes.every( v => (v === lines[0].slice(0, prefixLen)) )
    return prefixIsTrimmable && prefixesAreEqual
}

// Finds a minimum padding length
function getCommonStartPadding(lines: Array<string>) {
    let knownMaxLen = 0
    let currentLen = 0
    if (lines.length) {
        while (true) {
            currentLen++
            if (spaceSectionEquals(lines, currentLen)) {
                knownMaxLen = currentLen
            } else break
        }
    }
    return knownMaxLen
}

// Regular expressions, used to parse the examples
const exampleRegExps: { [id: string] : RegExp; } = {
    beginFragment: new RegExp('[\s\t]*(\/\/|#) (BEGIN FRAGMENT): ([A-Za-z_\-]+)[\s\t]*'),
    endFragment: new RegExp('[\s\t]*(\/\/|#) (END FRAGMENT)[\s\t]*'),
    beginEscape: new RegExp('[\s\t]*(\/\/|#) (BEGIN ESCAPE)[\s\t]*'),
    endEscape: new RegExp('[\s\t]*(\/\/|#) (END ESCAPE)[\s\t]*'),
}

// A stack machine that collects the examples
// by the special comments, telling about the start and end
// of a fragment and an escape section.
export class ExampleParser {
    lines: Array<string>

    constructor(content: string) {
      this.lines = content.split('\n')
    }

    detectLineType(line: string): Array<string> | null {
        let result: Array<string> | null = null
        let matchTmp: RegExpMatchArray | null
        if ((matchTmp = line.match(exampleRegExps.beginFragment))) {
            result = [ matchTmp[2], matchTmp[3] ]
        }
        if ((matchTmp = line.match(exampleRegExps.endFragment))) {
            result = [ matchTmp[2] ]
        }
        if ((matchTmp = line.match(exampleRegExps.beginEscape))) {
            result = [ matchTmp[2] ]
        }
        if ((matchTmp = line.match(exampleRegExps.endEscape))) {
            result = [ matchTmp[2] ]
        }
        return result
    }

    // Returns either a string, containing a given range of lines between "start" and "end"
    // or null if it's not available
    retrieveTextSection(start: number, end: number, ignore: Array<number>): string | null {
        let result: string | null = null
        if (end > start) {
            let tmpResult: Array<string> = []
            for (let lineId = start; lineId < end; lineId++) {
                if (ignore.indexOf(lineId) == -1) tmpResult.push(this.lines[lineId])
            }
            if (tmpResult.length > 0) {
                result = clearIndentation(
                    trimEmptyLines(tmpResult)
                ).join('\n')
            }
        } 
        return result
    }

    mapLines(): {[name: string]: string;} {
        // Stack machine variables for a fragment
        let fragmentStack = Array()
        let fragmentSections = Array()
        let fragmentMap: {[name: string]: string;} = {}
        // Stack machine variables for escaping
        let escapeStack = Array()
        let escapeList = Array()
        // Iterate lines, running a stack machine for both fragments
        // and escaping
        let lineType: Array<string> | null
        for (let lineId=0; lineId<this.lines.length; lineId++) {
            lineType = this.detectLineType(this.lines[lineId])
            if (lineType) {
                if (lineType[0] == 'BEGIN FRAGMENT') {
                    fragmentStack.push([lineId, lineType[1]])
                    if (escapeList.indexOf(lineId) == -1) escapeList.push(lineId)
                }
                else if (lineType[0] == 'END FRAGMENT') {
                    // If there's an associated "BEGIN FRAGMENT" statement,
                    // continue normally, throw an error otherwise.
                    if (fragmentStack.length > 0) {
                        let tmp = fragmentStack.pop()
                        if (escapeList.indexOf(lineId) == -1) escapeList.push(lineId)
                        let fragmentStart: number = tmp[0]
                        fragmentSections.push([fragmentStart, lineId, tmp[1]])
                    } else {
                        throw new ExampleSyntaxError(
                            `Ending a code fragment without a beginning one on line ${lineId}.` +
                            `Content: "${this.lines[lineId]}"`
                        )
                    }
                }
                else if (lineType[0] == 'BEGIN ESCAPE') {
                    escapeStack.push([lineId, lineType[0]])
                    if (escapeList.indexOf(lineId) == -1) escapeList.push(lineId)
                }
                else if (lineType[0] == 'END ESCAPE') {
                    // If there's an associated "BEGIN ESCAPE" statement,
                    // continue normally, throw an error otherwise.
                    if (fragmentStack.length > 0) {
                        let tmp = escapeStack.pop()
                        if (escapeList.indexOf(lineId) == -1) escapeList.push(lineId)
                        escapeList.push(...range(tmp[0], lineId))
                    }
                    else {
                        throw new ExampleSyntaxError(
                            `Ending the escape section without a beginning one on line ${lineId}.` +
                            `Content: "${this.lines[lineId]}"`
                        )
                    }
                }
            }
        }
        // Check for the hanging "BEGIN FRAGMENT" statements
        if (fragmentStack.length > 0) {
            const fstHangingId = fragmentStack[0][0]
            throw new ExampleSyntaxError(
                `Beginning fragment without ending it on line ${fstHangingId}.` +
                `Content: "${this.lines[fstHangingId]}"`
            )
        }
        // Check for the hanging "BEGIN ESCAPE" statements
        if (escapeStack.length) {
            const estHangingId = escapeStack[0][0]
            throw new ExampleSyntaxError(
                `Beginning escape without ending it on line ${estHangingId}.` +
                `Content: "${this.lines[estHangingId]}"`
            )
        }
        // Fill the fragment map with the stack machine results
        for (let fsid = 0; fsid < fragmentSections.length; fsid++) {
            let startLineId = fragmentSections[fsid][0]
            let endLineId = fragmentSections[fsid][1]
            let textSection = this.retrieveTextSection(
                startLineId, endLineId, escapeList
            )
            if (textSection) {
                fragmentMap[fragmentSections[fsid][2]] = textSection
            }
        }
        // Return the lines, collected by the stack machine
        return fragmentMap
    }
}
