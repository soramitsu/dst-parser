import * as fs from "fs"
import { ExampleParser } from "../src/index"

export function parseFile (txtPath: string) {
    // Load a text to test from the FS
    let text: string = ''
    try {
        text = fs.readFileSync(txtPath, 'utf8').toString()
    } catch (e: any) {
        console.log('Error:', e.stack)
    }
    // Initialize the parser
    let parser_inst: ExampleParser = new ExampleParser(text)
    return parser_inst.mapLines()
}

export function parseStr (text: string) {
    // Initialize the parser
    let parser_inst: ExampleParser = new ExampleParser(text)
    return parser_inst.mapLines()
}