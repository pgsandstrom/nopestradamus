import { describe, expect, it } from 'vitest'

import { orderMigrations } from './migrate.ts'

describe('orderMigrations', () => {
  it('orders by number rather than by text', () => {
    expect(orderMigrations(['010-ten.sql', '002-two.sql', '001-one.sql'])).toEqual([
      '001-one.sql',
      '002-two.sql',
      '010-ten.sql',
    ])
  })

  it('ignores anything that is not sql', () => {
    expect(orderMigrations(['001-one.sql', 'README.md', '.gitkeep'])).toEqual(['001-one.sql'])
  })

  it('rejects a name that does not carry a number', () => {
    expect(() => orderMigrations(['add-index.sql'])).toThrow(/must be named/)
  })

  it('rejects two migrations claiming the same number', () => {
    expect(() => orderMigrations(['002-a.sql', '002-b.sql'])).toThrow(/share a number/)
  })
})
