import { resolve } from 'path'
import { readFileSync } from 'fs'
import { ExampleParser } from '../src/index'

export function parseStr (text: string) {
    // Initialize the parser
    let parser_inst: ExampleParser = new ExampleParser(text)
    return parser_inst.mapLines()
}

export function parseFile (txtPath: string) {
    // Resolve a path
    const txtPathResolved = resolve(__dirname, './samples', txtPath)
    // Initialize the parser
    return parseStr(
        // Load a text to test from the FS
        readFileSync(txtPathResolved, 'utf8').toString()
    )
}