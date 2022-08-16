import {
    parseFile,
    parseStr
} from './test_util'
import {
    ExampleSyntaxError
} from "../src/index"

test('Common | An empty string', () => {
    let parsed = parseStr('')
    let expected = {}
    expect(parsed).toStrictEqual(expected)
})

test('Rust / C | Code section', () => {
    let parsed = parseFile('./test/samples/code_section.rs')
    let expected = {
        RustStyleFragment: 'println!("A normal Rust-style fragment");'
    }
    expect(parsed).toStrictEqual(expected)
})

test('Rust / C | Indentation levels', () => {
    let parsed = parseFile('./test/samples/code_section_2.rs')
    let expected = {
        RustStyleFragment: 'fn main() {\n    println!("A normal Rust-style fragment");\n}'
    }
    expect(parsed).toStrictEqual(expected)
})

test('Python | Code section', () => {
    let parsed = parseFile('./test/samples/code_section.py')
    let expected = {
        "PythonStyleFragment": "print(\"A normal Python code fragment\")"
    }
    expect(parsed).toStrictEqual(expected)
})

test('Python | Indentation levels', () => {
    let parsed = parseFile('./test/samples/code_section_2.py')
    let expected = {
        "PythonStyleFragment": "def main():\n    print(\"A normal Rust-style fragment\")",
    }
    expect(parsed).toStrictEqual(expected)
})

test('Python | Test for Python-style comments', () => {
    let parsed = parseFile('./test/samples/normal_py_style.py')
    let expected = {
        PythonicFragment: "print('TEST')"
    }
    expect(parsed).toStrictEqual(expected)
})

test('Rust / C | Nested fragment escape', () => {
    let parsed = parseFile('./test/samples/nested_fragment_escape.c')
    let expected = {
        TestB: 'is displayed',
        TestA: 'This part\nis displayed'
    }
    expect(parsed).toStrictEqual(expected)
})

test('Python | Nested fragment escape', () => {
    let parsed = parseFile('./test/samples/nested_fragment_escape.py')
    let expected = {
        TestB: 'is displayed',
        TestA: 'This part\nis displayed'
    }
    expect(parsed).toStrictEqual(expected)
})

test('Rust / C | A nested escape with a fragment placed inside the escape text', () => {
    let parsed = parseFile('./test/samples/nested_escape_test.c')
    let expected = {
        TestA: 'This part is displayed'
    }
    expect(parsed).toStrictEqual(expected)
})

test('Python | A nested escape with a fragment placed inside the escape text', () => {
    let parsed = parseFile('./test/samples/nested_escape_test.py')
    let expected = {
        TestA: 'This part is displayed'
    }
    expect(parsed).toStrictEqual(expected)
})

test("Rust / C | An unmatched \"BEGIN FRAGMENT\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_begin_fragment.rs')
    }
    expect(unmatched).toThrow(Error)
})

test("Rust / C | An unmatched \"END FRAGMENT\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_end_fragment.rs')
    }
    expect(unmatched).toThrow(Error)
})

test("Rust / C | An unmatched \"BEGIN ESCAPE\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_begin_escape.rs')
    }
    expect(unmatched).toThrow(Error)
})

test("Rust / C | An unmatched \"END ESCAPE\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_end_fragment.rs')
    }
    expect(unmatched).toThrow(Error)
})

test("Python | An unmatched \"BEGIN FRAGMENT\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_begin_fragment.py')
    }
    expect(unmatched).toThrow(Error)
})

test("Python | An unmatched \"END FRAGMENT\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_end_fragment.py')
    }
    expect(unmatched).toThrow(Error)
})

test("Python | An unmatched \"BEGIN ESCAPE\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_begin_fragment.py')
    }
    expect(unmatched).toThrow(Error)
})

test("Python | An unmatched \"END ESCAPE\" statement", () => {
    const unmatched = () => {
        let parsed = parseFile('./test/samples/unmatched_end_fragment.py')
    }
    expect(unmatched).toThrow(Error)
})