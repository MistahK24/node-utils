const { isChar } = require('./utils');

const EscapeMode = {
  char: 'char',
  string: 'string',
  none: 'none',
};

const defaultConfig = {
  delimiter: ',',
  escapeChar: '\\',
  escapeMode: EscapeMode.char,
  keepEscapeChars: true,
};

class Tokenizer {
  constructor(config = {}) {
    config = {
      ...defaultConfig,
      ...config,
    };

    if (!isChar(config.delimiter)) {
      throw Error('"config.delimiter" must be a char');
    }

    if (config.escapeMode !== EscapeMode.none) {
      if (!isChar(config.escapeChar)) {
        throw Error('"config.escapeChar" must be a char');
      }
    }

    switch (config.escapeMode) {
      case EscapeMode.char:
      case EscapeMode.string:
      case EscapeMode.none:
        break;
      default:
        throw Error(`unrecognized escape mode: ${config.escapeMode}`);
    }

    this._config = config;
  }

  _isDelimiter(char) {
    return this._config.delimiter === char;
  }

  _isEscapeChar(char) {
    return this._config.escapeMode !== EscapeMode.none && this._config.delimiter === char;
  }

  _stripEscapeChars(token) {
    const chars = token.split('');
    const charsToKeep = [];

    for (let i = 0; i < chars.length; ) {
      const curChar = chars[i];

      if (curChar === this._config.escapeChar) {
        const nextChar = chars[i + 1];

        if (nextChar === this._config.escapeChar) {
          charsToKeep.push(nextChar);
          i += 2;
        } else {
          i++;
        }

        continue;
      }

      charsToKeep.push(curChar);
      i++;
    }

    return charsToKeep.join('');
  }

  getTokens(line) {
    function getToken(start, end) {
      if (start === end) {
        return '';
      } else {
        return line.slice(start, end);
      }
    }

    const lineLength = line.length;
    const tokens = [];
    let currentPos = 0;
    let tokenStartPos = currentPos;

    // Get tokens up to the last token.
    while (currentPos < lineLength) {
      if (line[currentPos] === this._config.delimiter) {
        const token = getToken(tokenStartPos, currentPos);

        if (this._config.keepEscapeChars) {
          tokens.push(token);
        } else {
          tokens.push(this._stripEscapeChars(token));
        }

        tokenStartPos = currentPos + 1;
      } else if (this._config.escapeMode !== EscapeMode.none) {
        if (line[currentPos] === this._config.escapeChar) {
          switch (this._config.escapeMode) {
            case EscapeMode.char: {
              currentPos++;
              break;
            }
            case EscapeMode.string: {
              currentPos++;

              while (line[currentPos] !== this._config.escapeChar) {
                if (currentPos > lineLength) {
                  throw Error('escaped strings must start and end with an escape character');
                }

                currentPos++;
              }

              break;
            }
          }
        }
      }

      currentPos++;
    }

    // Get the last token.
    tokens.push(getToken(tokenStartPos, currentPos, line));

    return tokens;
  }
}

module.exports = {
  EscapeMode,
  Tokenizer,
};
