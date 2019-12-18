function isChar(val) {
  return typeof val === 'string' && val.length === 1;
}

module.exports = {
  isChar,
};
