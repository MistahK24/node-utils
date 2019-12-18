const fs = require('fs');

const WINDOWS_LINE_END = 13;
const POSIX_LINE_END = 10;
const [LINE_END, LINE_END_SIZE] = (() => {
  switch (process.platform) {
    case 'win32':
      return [WINDOWS_LINE_END, 2];
    default:
      return [POSIX_LINE_END, 1];
  }
})();
const LINE_END_OFFSET = LINE_END_SIZE - 1;

function* getLinesSync(filePath) {
  // Open the file.
  let fd = fs.openSync(filePath, 'r');
  let buffer = fs.readFileSync(fd);

  // Set loop variables.
  let currentPos = 0;
  let lineStartPos = currentPos;

  // While there are more lines to read.
  while (currentPos < buffer.length) {
    // While there are more characters to read in the current line.
    while (currentPos < buffer.length && buffer[currentPos] !== LINE_END) {
      currentPos++;
    }

    // Determine range of buffer containing the line.
    if (lineStartPos > currentPos - LINE_END_OFFSET) {
      yield '';
    } else {
      yield buffer.slice(lineStartPos, currentPos).toString();
    }

    // Prepare for next iteration.
    currentPos += LINE_END_SIZE;
    lineStartPos = currentPos;
  }
}

module.exports = {
  getLinesSync,
};
