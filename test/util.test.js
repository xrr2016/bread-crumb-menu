const { isValidFileName, isValidChineseName } = require('../lib/util')

describe('测试 util.isValidFileName 的函数', () => {
  test('是一个函数', () => {
    expect(typeof isValidFileName).toBe('function')
  })

  test('不传参数时返回 false', () => {
    expect(isValidFileName()).toBe(false)
  })

  test('传无效参数时返回 false', () => {
    expect(isValidFileName(null)).toBe(false)
    expect(isValidFileName(undefined)).toBe(false)
    expect(isValidFileName('')).toBe(false)
    expect(isValidFileName({})).toBe(false)
    expect(isValidFileName([])).toBe(false)
    expect(isValidFileName(' ')).toBe(false)
  })

  test('传无效字符串参数时返回 false', () => {
    expect(isValidFileName('-')).toBe(false)
    expect(isValidFileName('<')).toBe(false)
    expect(isValidFileName('/bbb')).toBe(false)
  })

  test('传有效字符串参数时返回 true', () => {
    expect(isValidFileName('aaa')).toBe(true)
    expect(isValidFileName('aaa-bbb')).toBe(true)
  })
})

describe('测试 util.isValidChineseName 的函数', () => {
  test('是一个函数', () => {
    expect(typeof isValidChineseName).toBe('function')
  })

  test('不传参数时返回 false', () => {
    expect(isValidChineseName()).toBe(false)
  })

  test('传无效参数时返回 false', () => {
    expect(isValidChineseName(null)).toBe(false)
    expect(isValidChineseName(undefined)).toBe(false)
    expect(isValidChineseName('')).toBe(false)
    expect(isValidChineseName({})).toBe(false)
    expect(isValidChineseName([])).toBe(false)
    expect(isValidChineseName(' ')).toBe(false)
  })

  test('传无效字符串参数时返回 false', () => {
    expect(isValidChineseName('-')).toBe(false)
    expect(isValidChineseName('<')).toBe(false)
    expect(isValidChineseName('/bbb')).toBe(false)
    expect(isValidChineseName('aaa')).toBe(false)
    expect(isValidChineseName('aaa-bbb')).toBe(false)
  })

  test('传有效字符串参数时返回 true', () => {
    expect(isValidChineseName('啊啊啊')).toBe(true)
    expect(isValidChineseName('笨笨笨')).toBe(true)
    expect(isValidChineseName('惨惨惨')).toBe(true)
  })
})
