import { parseFile } from './test_util'
import { ParserSyntaxError } from '../src/index'
import { describe, expect, it } from 'vitest'

describe('Exception handling tests: pythonic syntax', () => {
    it('throws an exception when a "BEGIN FRAGMENT" statement is unmatched', () => {
        const unmatched = () => parseFile('unmatched_begin_fragment.py')
        expect(unmatched).toThrow(ParserSyntaxError)
    })
    
    it('throws an exception when "END FRAGMENT" statement is unmatched', () => {
        const unmatched = () => parseFile('unmatched_end_fragment.py')
        expect(unmatched).toThrow(ParserSyntaxError)
    })
    
    it('throws an exception when "BEGIN ESCAPE" statement is unmatched', () => {
        const unmatched = () => parseFile('unmatched_begin_escape.py')
        expect(unmatched).toThrow(ParserSyntaxError)
    })
    
    it('throws an exception when "END ESCAPE" statement is unmatched', () => {
        const unmatched = () => parseFile('unmatched_end_escape.py')
        expect(unmatched).toThrow(ParserSyntaxError)
    })
})
