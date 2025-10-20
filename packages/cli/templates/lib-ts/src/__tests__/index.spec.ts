import { describe, expect, it } from 'vitest'
import { sum } from '../index'

describe('sample Test Suite', () => {
  it('sum works', () => expect(sum([1, 2, 3])).toBe(6))
})
