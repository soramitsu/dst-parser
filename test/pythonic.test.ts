import { parseFile } from './test_util'
import { describe, expect, it } from 'vitest'

describe('Python syntax tests', () => {
    it('Code section', () => {
        let parsed = parseFile('code_section.py')
        expect(parsed).toMatchSnapshot()
    })
    
    it('Indentation levels', () => {
        let parsed = parseFile('code_section_2.py')
        expect(parsed).toMatchSnapshot()
    })
    
    it('Test for Python-style comments', () => {
        let parsed = parseFile('normal_py_style.py')
        expect(parsed).toMatchSnapshot()
    })
    
    it('Nested fragment escape', () => {
        let parsed = parseFile('nested_fragment_escape.py')
        expect(parsed).toMatchSnapshot()
    })
    
    it('A nested escape with a fragment placed inside the escape text', () => {
        let parsed = parseFile('nested_escape_test.py')
        expect(parsed).toMatchSnapshot()
    })
})