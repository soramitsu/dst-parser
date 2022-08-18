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

type FragmentToken = {
    // A name for "BEGIN FRAGMENT" token
    f_name: string
    // A line number the token was found at
    line: number
}

// A reference to the section: start line, end line, name
type SectionRef = {
    // Start line
    start: number
    // End line
    end: number
    // Name of the section
    name: string
}

// A custom error type to be used with broken syntax
export class ParserSyntaxError extends Error {
    constructor(message = '') {
      super(message)
      this.message = message
    }
}

// A custom error type made to show errors in the parsing process
export class ParsingError extends Error {
    constructor(message = '') {
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
    return !str.trim().length
}

// Remove empty strings at both start and end
// in an array of lines
export function trimEmptyLines(lines: Array<string>) {
    // Remove the first and the last string if those are
    // filled with spaces or empty.
    // If the lines are empty, 'stub' string replaces undefined,
    // so there's no infinite cycle.
    /* c8 ignore next */
    while (lines.length && (emptySpace(lines.at(0) || 'stub'))) lines.shift()
    /* c8 ignore next */
    while (lines.length && (emptySpace(lines.at(-1) || 'stub'))) lines.pop()
    return lines
}

// Clear line indentation for an array of strings containing the lines
let removeCommonIndentation = function(lines: Array<string>) {
    // Calculate a padding common for all the lines
    let commonIndent: number = getCommonStartPadding(lines)
    // Return the lines with a common indentation removed
    return lines.map(
        line => line.slice(commonIndent)
    )
}

// Checks if whitespaces and tabs of a given prefix length are equal for all provided lines
export function spaceSectionIsEqual(lines: Array<string>, prefixLen: number) {
    let prefixes = lines.map(line => line.slice(0, prefixLen))
    let prefixIsTrimmable = lines[0].slice(0, prefixLen).trim().length === 0
    let prefixesAreEqual = prefixes.every( v => (v === lines[0].slice(0, prefixLen)) )
    return prefixIsTrimmable && prefixesAreEqual
}

// Finds a minimum padding length
export function getCommonStartPadding(lines: Array<string>) {
    let knownMaxLen = 0
    let currentLen = 0
    if (lines.length) {
        while (true) {
            currentLen++
            if (spaceSectionIsEqual(lines, currentLen)) {
                knownMaxLen = currentLen
            } else break
        }
    }
    return knownMaxLen
}

// Regular expressions, used to parse the examples
const exampleRegExps: { [id: string] : RegExp; } = {
    beginFragment: /[s\t]*(\/\/|#) (BEGIN FRAGMENT): ([A-Za-z_-]+)[s\t]*/,
    endFragment: /[s\t]*(\/\/|#) (END FRAGMENT)[s\t]*/,
    beginEscape: /[s\t]*(\/\/|#) (BEGIN ESCAPE)[s\t]*/,
    endEscape: /[s\t]*(\/\/|#) (END ESCAPE)[s\t]*/,
}

// A stack machine that collects the examples
// by the special comments, telling about the start and end
// of a fragment and an escape section.
export class ExampleParser {
    // A list of lines to be parsed
    lines: Array<string>
    // Initialize the parser
    constructor(content: string) {
      this.lines = content.split('\n')
    }
    // Match the line types against the available regular expressions
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
        if (start < end) {
            let tmpResult: Array<string> = []
            for (let lineId = start; lineId < end; lineId++) {
                if (ignore.indexOf(lineId) === -1) tmpResult.push(this.lines[lineId])
            }
            if (tmpResult.length > 0) {
                result = removeCommonIndentation(
                    trimEmptyLines(tmpResult)
                ).join('\n')
            }
        } 
        return result
    }

    // Does the actual parsing
    mapLines(): {[name: string]: string;} {
        // Stack machine variables for a fragment
        let fragmentStack: FragmentToken[] = []
        let fragmentSectionRefs: SectionRef[] = []
        let fragmentMap: {[name: string]: string;} = {}
        // Stack machine variables for escaping
        let escapeStack: number[] = []
        let escapeList: Array<number> = []
        // Iterate lines, running a stack machine for both fragments
        // and escaping
        let lineType: Array<string> | null
        for (let lineId=0; lineId<this.lines.length; lineId++) {
            lineType = this.detectLineType(this.lines[lineId])
            if (lineType) {
                if (lineType[0] === 'BEGIN FRAGMENT') {
                    // Add a fragment token with a line and a fragment name
                    // to the fragment stack
                    let fragTok: FragmentToken = {
                        line: lineId,
                        f_name: lineType[1]
                    }
                    fragmentStack.push(fragTok)
                    // Add the current line to the list of escaped lines
                    // if it wasn't already escaped
                    if (escapeList.indexOf(lineId) === -1) escapeList.push(lineId)
                }
                else if (lineType[0] === 'END FRAGMENT') {
                    let fragTokBegin: FragmentToken | undefined
                    // If there's an associated "BEGIN FRAGMENT" statement,
                    // continue normally, throw an error otherwise.
                    if (
                        fragmentStack.length > 0 &&
                        (fragTokBegin = fragmentStack.pop())
                    ) {
                        // Add the current line to the list of escaped lines
                        // if it wasn't already escaped
                        if (escapeList.indexOf(lineId) === -1) escapeList.push(lineId)
                        // Add a fragment section
                        let newSectionRef: SectionRef = {
                            start: fragTokBegin.line,
                            end: lineId,
                            name: fragTokBegin.f_name
                        }
                        fragmentSectionRefs.push(newSectionRef)
                    } else {
                        throw new ParserSyntaxError(
                            `Ending a code fragment without a beginning one on line ${lineId}.` +
                            `Content: "${this.lines[lineId]}"`
                        )
                    }
                }
                else if (lineType[0] === 'BEGIN ESCAPE') {
                    // Mark a "begin escape" line in the stack
                    escapeStack.push(lineId)
                    // Add the current line to the list of escaped lines
                    // if it wasn't already escaped
                    if (escapeList.indexOf(lineId) === -1) escapeList.push(lineId)
                }
                else if (lineType[0] === 'END ESCAPE') {
                    // If there's an associated "BEGIN ESCAPE" statement,
                    // continue normally, throw an error otherwise.
                    if (escapeStack.length > 0) {
                        let escapeStartLine = escapeStack.pop()
                        if (escapeList.indexOf(lineId) === -1) escapeList.push(lineId)
                        if (escapeStartLine) escapeList.push(...range(escapeStartLine, lineId))
                    }
                    else {
                        throw new ParserSyntaxError(
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
            throw new ParserSyntaxError(
                `Beginning fragment without ending it on line ${fstHangingId}.` +
                `Content: "${this.lines[fstHangingId]}"`
            )
        }

        // Check for the hanging "BEGIN ESCAPE" statements
        if (escapeStack.length) {
            const estHangingId = escapeStack[0][0]
            throw new ParserSyntaxError(
                `Beginning escape without ending it on line ${estHangingId}.` +
                `Content: "${this.lines[estHangingId]}"`
            )
        }

        // Fill the fragment map with the stack machine results
        for (let fsid = 0; fsid < fragmentSectionRefs.length; fsid++) {
            // Retrieve a current text section
            let fsc = fragmentSectionRefs[fsid]
            const textSection = this.retrieveTextSection(
                fsc.start, fsc.end, escapeList
            )
            // If a text section is awailable, assign it to the fragment map
            if (textSection) fragmentMap[fsc.name] = textSection
        }

        // Return the lines, collected by the stack machine
        return fragmentMap
    }
}
