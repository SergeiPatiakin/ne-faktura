import { double } from "../main/app"

describe('app', () => {
  it('basic', () => {
    expect(double(3)).toBe(6)
  })
})
