const fs = require('fs');

const { Tokenizer, EscapeMode } = require('./Tokenizer');

/**
 * Base class for loaders. Basically used as an interface.
 */
class Loader {
  /* eslint-disable */
  *load() {
    throw Error('Not Implemented');
  }
  /* eslint-enable */
}

const DEFAULT_CSV_LOADER_CONFIG = {
  hasHeader: true,
  rowDelimiter: '\n',
  rowEscapeChar: '"',
  rowEscapeMode: EscapeMode.string,
  rowKeepEscapeChars: true,
  colDelimiter: ',',
  colEscapeChar: '"',
  colEscapeMode: EscapeMode.string,
  colKeepEscapeChars: true,
};

/**
 * Loader for loading data from a csv file.
 */
class CsvLoader extends Loader {
  constructor(config) {
    super();

    if (!config.csvFile) {
      throw Error('you must specify a path to a csv file');
    }

    this._config = { ...DEFAULT_CSV_LOADER_CONFIG, ...config };

    this._rowTokenizer = new Tokenizer({
      delimiter: this._config.rowDelimiter,
      escapeChar: this._config.rowEscapeChar,
      escapeMode: this._config.rowEscapeMode,
      keepEscapeChars: this._config.rowKeepEscapeChars,
    });
    this._colTokenizer = new Tokenizer({
      delimiter: this._config.colDelimiter,
      escapeChar: this._config.colEscapeChar,
      escapeMode: this._config.colEscapeMode,
      keepEscapeChars: this._config.colKeepEscapeChars,
    });
  }

  *load() {
    const buffer = fs.readFileSync(this._config.csvFile).toString();
    const lines = this._rowTokenizer.getTokens(buffer);

    // Remove header line. Table objects are configured with headers.
    if (this._config.hasHeader) {
      lines.shift();
    }

    // Remove the last line if it is empty.
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    // Yield an array of column values for each line.
    for (const line of lines) {
      yield this._colTokenizer.getTokens(line);
    }
  }
}

module.exports = {
  Loader,
  CsvLoader,
};
