import { ParserSyntaxError, ParsingError } from '../src/index'
import { describe, expect, it } from 'vitest'

describe('Exception handling tests: common', () => {
    it('can create ParserSyntaxError instances', () => {
        let message = 'Beginning escape without ending it on line 42.'
        let ese = new ParserSyntaxError(message)
        expect(ese.constructor.name).toMatchSnapshot()
    })

    it('can create ParsingError instances', () => {
        let message = 'This code section should not be reached.'
        let ese = new ParsingError(message)
        expect(ese.constructor.name).toMatchSnapshot()
    })
})