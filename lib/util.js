function isValidFolderName(foldeName = '') {
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

module.exports = {
  isValidFolderName
}
