import { parseStr } from './test_util'
import {
    trimEmptyLines, getCommonStartPadding,
    spaceSectionIsEqual
} from '../src/index'
import { describe, expect, it } from 'vitest'

describe('Common tests', () => {
    it('handles an empty string', () => {
      let parsed = parseStr('')
      expect(parsed).toMatchSnapshot()
    })

    it('can trim empty lines at the start, which may change indentation otherwise', () => {
        let lines = ['  ', '   ', 'Source code is expected to be here']
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toMatchSnapshot()
    })

    it('can trim empty lines at the end, which may change indentation otherwise', () => {
        let actual_text = 'Source code is expected to be here'
        let lines = [actual_text, '\t  ', '  \t']
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toMatchSnapshot()
    })

    it('can handle empty line lists that can not be trimmed', () => {
        let lines = []
        let trimmed = trimEmptyLines(lines)
        expect(trimmed).toMatchSnapshot()
    })

    it('can find a common start padding', () => {
        let lines = ['    a', '    b', '    c']
        let padding = getCommonStartPadding(lines)
        expect(padding).toMatchSnapshot()
        lines = ['    a', '  b', '   c']
        padding = getCommonStartPadding(lines)
        expect(padding).toMatchSnapshot()
    })

    it('can find a common start padding', () => {
        let lines = ['    a', '    b', '    c']
        let padding = getCommonStartPadding(lines)
        expect(padding).toMatchSnapshot()
        lines = ['    a', '  b', '   c']
        padding = getCommonStartPadding(lines)
        expect(padding).toMatchSnapshot()
    })

    it('can check that space padding is equal to a given value', () => {
        let lines = ['    a', '    b', '    c']
        expect(spaceSectionIsEqual(lines, 4)).toMatchSnapshot()
        lines = ['    a', '  b', '   c']
        expect(spaceSectionIsEqual(lines, 4)).toMatchSnapshot()
    })
})