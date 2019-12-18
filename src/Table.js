const { Loader } = require('./loaders');

// const config = {
//   columns: {
//     'customer': {
//       // Index with array of tokens.
//       position: 0,
//       // Perform validation and value processing.
//       process: () => {}
//     },
//   },
//   key: () => {} // fn or string
// }

class Table {
  constructor(config) {
    // Private props.
    this._returnCopies = config.returnCopies ? config.returnCopies : false;
    this._key = undefined;
    this._columns = {};
    this._data = {};

    // Check key.
    if (typeof config.key === 'function') {
      this._key = config.key;
    } else {
      throw Error('config requires a key function');
    }

    // Check columns.
    if (typeof config.columns === 'object') {
      for (const [columnName, columnConfig] of Object.entries(config.columns)) {
        if (!(typeof columnConfig.position === 'number' && columnConfig.position >= 0)) {
          throw Error('column.position must be a zero based index number');
        }

        if (columnConfig.process && typeof columnConfig.process !== 'function') {
          throw Error('column.process must be a function');
        }

        this._columns[columnName] = { ...columnConfig };
      }
    }
  }

  load(loader, upsert = false) {
    if (!(loader instanceof Loader)) {
      throw Error('loader must be of type Loader');
    }

    let rowCount = 1;

    try {
      for (const row of loader.load()) {
        if (upsert) {
          this.upsert(row);
        } else {
          this.create(row);
        }

        rowCount++;
      }
    } catch (err) {
      let _err;

      if (err instanceof Error) {
        _err = err.message;
      } else {
        _err = String(err);
      }

      throw Error(`Error loading row ${rowCount}: ${_err}`);
    }
  }

  _checkRow(row) {
    let rowObj = {};

    for (const [columnName, columnConfig] of Object.entries(this._columns)) {
      let rowValue;

      if (row instanceof Array) {
        rowValue = row[columnConfig.position];
      } else {
        rowValue = row[columnName];
      }

      if (rowValue === undefined) {
        if (columnConfig.required) {
          throw Error(`Missing required column "${columnName}"`);
        } else if (columnConfig.default !== undefined) {
          rowValue = columnConfig.default;
        }
      }

      if (columnConfig.process) {
        rowValue = columnConfig.process(rowValue);
      }

      rowObj[columnName] = rowValue;
    }

    return rowObj;
  }

  _getRow(rowId) {
    const row = this._data[rowId];

    if (this._returnCopies) {
      return row ? { ...row } : undefined;
    } else {
      return row;
    }
  }

  create(row) {
    const _row = this._checkRow(row);
    const rowId = this._key(_row);

    if (typeof rowId !== 'string') {
      throw Error('row ids must be a string');
    }

    if (this._data[rowId]) {
      throw Error(`row with id "${rowId}" already exists`);
    } else {
      this._data[rowId] = _row;
    }

    return this._getRow(rowId);
  }

  createMany(rows) {
    if (rows instanceof Array) {
      const newRows = [];

      for (const row of rows) {
        newRows.push(this.create(row));
      }

      return newRows;
    } else {
      throw Error('rows must be an array of rows');
    }
  }

  read(rowId) {
    return this._getRow(rowId);
  }

  readWhere(predicate) {
    const matches = [];

    for (const rowId of Object.keys(this._data)) {
      const row = this._getRow(rowId);

      if (predicate(row)) {
        matches.push(row);
      }
    }

    return matches;
  }

  update(row) {
    if (typeof row === 'object') {
      const rowId = this._key(row);
      const _row = this._getRow(rowId);

      if (!_row) {
        throw Error(`row with id "${rowId}" does not exist`);
      }

      // Merge existing row properties with new properties and validate.
      this._data[rowId] = this._checkRow({ ..._row, ...row });

      // Return the updated row.
      return this._getRow(rowId);
    } else {
      throw Error('row must be an object');
    }
  }

  updateMany(rows) {
    if (rows instanceof Array) {
      for (const row of rows) {
        this.update(row);
      }
    } else {
      throw Error('rows must be an array of rows');
    }
  }

  delete(rowId) {
    if (typeof rowId === 'string') {
      delete this._data[rowId];
    } else {
      throw Error('rowId must be a string');
    }
  }

  deleteMany(rowIds) {
    if (rowIds instanceof Array) {
      for (const rowId of rowIds) {
        this.delete(rowId);
      }
    } else {
      throw Error('rowIds must be an array of row ids');
    }
  }

  upsert(row) {
    if (this._data[this._key(row)]) {
      this.update(row);
    } else {
      this.create(row);
    }
  }

  upsertMany(rows) {
    for (const row of rows) {
      this.upsert(row);
    }
  }

  // copy() {

  // }

  *[Symbol.iterator]() {
    for (const rowId of Object.keys(this._data)) {
      yield this._getRow(rowId);
    }
  }
}

module.exports = {
  Table,
};
