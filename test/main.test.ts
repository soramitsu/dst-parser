import { parseFile, parseStr } from './test_util'
import { ExampleSyntaxError, trimEmptyLines, getCommonStartPadding } from "../src/index"
import { describe, expect, it } from 'vitest'

describe('Common tests', function () {
    it('handles an empty string', function () {
      let parsed = parseStr('')
      let expected = {}
      expect(parsed).toStrictEqual(expected)
    })

    it('can trim empty lines at the start, which may change indentation otherwise', function () {
        let actual_text = 'Source code is expected to be here'
        let lines = ['  ', '   ', actual_text]
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toStrictEqual([actual_text])
    })

    it('can trim empty lines at the end, which may change indentation otherwise', function () {
        let actual_text = 'Source code is expected to be here'
        let lines = [actual_text, '\t  ', '  \t']
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toStrictEqual([actual_text])
    })

    it('can handle empty line lists that can not be trimmed', function () {
        let actual_lines = []
        let lines = []
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toStrictEqual(actual_lines)
    })

    it('can find a common start padding', function () {
        let lines = ['    a', '    b', '    c']
        let padding = getCommonStartPadding(lines)
        expect(padding).toStrictEqual(4)
        lines = ['    a', '  b', '   c']
        padding = getCommonStartPadding(lines)
        expect(padding).toStrictEqual(2)
    })
})

describe('Exception handling tests: common', function () {
    it('can create ExampleSyntaxError instances', function () {
        let message = 'Beginning escape without ending it on line 42.'
        let ese = new ExampleSyntaxError(message)
        expect(ese.constructor.name).toStrictEqual('ExampleSyntaxError')
    })
})

describe('Exception handling tests: pythonic syntax', function () {
    it('throws an exception when a "BEGIN FRAGMENT" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_begin_fragment.py')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "END FRAGMENT" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_end_fragment.py')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "BEGIN ESCAPE" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_begin_fragment.py')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "END ESCAPE" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_end_escape.py')
        }
        expect(unmatched).toThrow(Error)
    })
})

describe('Exception handling tests: pythonic syntax', function () {
    it('throws an exception when "BEGIN FRAGMENT" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_begin_fragment.rs')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "END FRAGMENT" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_end_fragment.rs')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "BEGIN ESCAPE" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_begin_escape.rs')
        }
        expect(unmatched).toThrow(Error)
    })
    
    it('throws an exception when "END ESCAPE" statement is unmatched', () => {
        const unmatched = () => {
            let parsed = parseFile('./test/samples/unmatched_end_escape.rs')
        }
        expect(unmatched).toThrow(Error)
    })
})

describe('Rust / Java / C syntax tests', function () {
    it('handles a code section', function () {
        let parsed = parseFile('./test/samples/code_section.rs')
        let expected = {
            RustStyleFragment: 'println!("A normal Rust-style fragment");'
        }
        expect(parsed).toStrictEqual(expected)
    })
  
    it('handles the indentation levels', function () {
        let parsed = parseFile('./test/samples/code_section_2.rs')
        let expected = {
            RustStyleFragment: 'fn main() {\n    println!("A normal Rust-style fragment");\n}'
        }
        expect(parsed).toStrictEqual(expected)
    })

    it('handles a nested fragment escape normally', () => {
        let parsed = parseFile('./test/samples/nested_fragment_escape.c')
        let expected = {
            TestB: 'is displayed',
            TestA: 'This part\nis displayed'
        }
        expect(parsed).toStrictEqual(expected)
    })

    it('handles a nested escape with a fragment placed inside the escape text', () => {
        let parsed = parseFile('./test/samples/nested_escape_test.c')
        let expected = {
            TestA: 'This part is displayed'
        }
        expect(parsed).toStrictEqual(expected)
    })
})

describe('Python syntax tests', function () {
    it('Code section', () => {
        let parsed = parseFile('./test/samples/code_section.py')
        let expected = {
            "PythonStyleFragment": "print(\"A normal Python code fragment\")"
        }
        expect(parsed).toStrictEqual(expected)
    })
    
    it('Indentation levels', () => {
        let parsed = parseFile('./test/samples/code_section_2.py')
        let expected = {
            "PythonStyleFragmentA": "def main():\n    print(\"A normal Pythonic fragment\")",
            "PythonStyleFragmentB": "self.a = 0\nself.b = 1",
        }
        expect(parsed).toStrictEqual(expected)
    })
    
    it('Test for Python-style comments', () => {
        let parsed = parseFile('./test/samples/normal_py_style.py')
        let expected = {
            PythonicFragment: "print('TEST')"
        }
        expect(parsed).toStrictEqual(expected)
    })
    
    it('Nested fragment escape', () => {
        let parsed = parseFile('./test/samples/nested_fragment_escape.py')
        let expected = {
            TestB: 'is displayed',
            TestA: 'This part\nis displayed'
        }
        expect(parsed).toStrictEqual(expected)
    })
    
    it('A nested escape with a fragment placed inside the escape text', () => {
        let parsed = parseFile('./test/samples/nested_escape_test.py')
        let expected = {
            TestA: 'This part is displayed'
        }
        expect(parsed).toStrictEqual(expected)
    })
})