const { isValidFolderName } = require('../lib/util')

describe('测试 util.isValidFolderName 的函数', () => {
  test('是一个函数', () => {
    expect(typeof isValidFolderName).toBe('function')
  })

  test('不传参数时返回 false', () => {
    expect(isValidFolderName()).toBe(false)
  })

  test('传无效参数时返回 false', () => {
    expect(isValidFolderName(null)).toBe(false)
    expect(isValidFolderName(undefined)).toBe(false)
    expect(isValidFolderName('')).toBe(false)
    expect(isValidFolderName({})).toBe(false)
    expect(isValidFolderName(1234)).toBe(false)
    expect(isValidFolderName(' ')).toBe(false)
  })

  test('传无效字符串参数时返回 false', () => {
    expect(isValidFolderName('-')).toBe(false)
    expect(isValidFolderName('<')).toBe(false)
    expect(isValidFolderName('/bbb')).toBe(false)
  })

  test('传有效字符串参数时返回 true', () => {
    expect(isValidFolderName('aaa')).toBe(true)
    expect(isValidFolderName('aaa-bbb')).toBe(true)
  })
})
