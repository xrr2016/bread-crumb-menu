function isValidFileName(foldeName = '') {
  if (!foldeName || typeof foldeName !== 'string') {
    return false
  }

  if (!foldeName.trim()) {
    return false
  }

  if (!/^\w/.test(foldeName)) {
    return false
  }

  return true
}

function isValidChineseName(chineseName = '') {
  if (!chineseName || typeof chineseName !== 'string') {
    return false
  }

  if (!chineseName.trim()) {
    return false
  }

  if (!/^[\u4e00-\u9fa5]{0,}$/.test(chineseName)) {
    return false
  }

  return true
}

module.exports = {
  isValidFileName,
  isValidChineseName
}
