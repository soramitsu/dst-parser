import { parseFile } from './test_util'
import { describe, expect, it } from 'vitest'

describe('Rust / Java / C syntax tests', () => {
    it('handles a code section', () => {
        let parsed = parseFile('code_section.rs')
        expect(parsed).toMatchSnapshot()
    })
  
    it('handles the indentation levels', () => {
        let parsed = parseFile('code_section_2.rs')
        expect(parsed).toMatchSnapshot()
    })

    it('handles a nested fragment escape normally', () => {
        let parsed = parseFile('nested_fragment_escape.c')
        expect(parsed).toMatchSnapshot()
    })

    it('handles a nested escape with a fragment placed inside the escape text', () => {
        let parsed = parseFile('nested_escape_test.c')
        expect(parsed).toMatchSnapshot()
    })
})