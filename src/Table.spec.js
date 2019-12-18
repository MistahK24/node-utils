const { expect } = require('chai');

const { Table } = require('./Table');
const { Loader } = require('./loaders');

describe('Table.js', () => {
  let table;

  beforeEach(() => {
    table = new Table({
      key: (row) => String(row.id),
      columns: {
        id: {
          position: 0,
          required: true,
          process: (val) => {
            val = parseInt(val);

            if (isNaN(val)) {
              throw Error('id must be an integer');
            } else {
              return val;
            }
          },
        },
        name: {
          position: 1,
          required: true,
        },
        hobby: {
          position: 2,
          default: '',
        },
      },
    });
  });

  describe('_checkRow()', () => {
    it('should create a new row object from an array', () => {
      const row = table._checkRow(['1', 'Thomas', 'Fishing']);
      expect(row).to.deep.equal({ id: 1, name: 'Thomas', hobby: 'Fishing' });
    });

    it('should create a new row object from an object', () => {
      const row = table._checkRow({ id: '1', name: 'Thomas', hobby: 'Fishing' });
      expect(row).to.deep.equal({ id: 1, name: 'Thomas', hobby: 'Fishing' });
    });

    it('should throw an error if a required column is missing', () => {
      const rowArrMissing = [undefined, 'Thomas', 'Fishing'];
      const rowObjMissing = { id: undefined, name: 'Thomas', hobby: 'Fishing' };
      expect(() => table._checkRow(rowArrMissing)).to.throw;
      expect(() => table._checkRow(rowObjMissing)).to.throw;
    });

    it('should add default values for missing columns', () => {
      const rowArrMissing = ['1', 'Thomas', undefined];
      const rowObjMissing = { id: '1', name: 'Thomas', hobby: undefined };
      expect(table._checkRow(rowArrMissing)).to.deep.equal({ id: 1, name: 'Thomas', hobby: '' });
      expect(table._checkRow(rowObjMissing)).to.deep.equal({ id: 1, name: 'Thomas', hobby: '' });
    });
  });

  describe('_getRow()', () => {
    it('should return a reference to a row if config._returnCopies is false', () => {
      table._returnCopies = false;
      table.create(['1', 'Thomas', 'Fishing']);
      const row = table._getRow('1');
      expect(row).to.equal(table._data['1']);
    });

    it('should return a copy of a row if config._returnCopies is true', () => {
      table._returnCopies = true;
      table.create(['1', 'Thomas', 'Fishing']);
      const row = table._getRow('1');
      expect(row).to.not.equal(table._data['1']);
      expect(row).to.deep.equal(table._data['1']);
    });
  });
  // describe('constructor()', () => {
  //   it('should throw an error if the config is invalid', () => {
  //     const configMissingKey = {
  //       columns: {
  //         'customer':
  //       }
  //     };
  //     throw Error('Not implemented');
  //   });
  // });

  describe('create()', () => {
    it('should insert a new row from an array', () => {
      const row = ['1', 'Thomas'];
      const result = table.create(row);
      expect(table._data['1']).to.deep.equal(result);
    });

    it('should insert a new row from an object', () => {
      const row = { id: '1', name: 'Thomas' };
      const result = table.create(row);
      expect(table._data['1']).to.deep.equal(result);
    });

    it('should throw an error if the row is malformed', () => {
      const row = { id: 'bad', name: 'Thomas' };
      expect(() => table.create(row)).to.throw;
    });

    it('should throw an error if the row already exists', () => {
      function createRow() {
        table.create({ id: '1', name: 'Thomas' });
      }

      // Create the row.
      createRow();
      // Another attempt to create a row with the same id should fail.
      expect(createRow).to.throw;
    });

    it("should throw an error if a non string value is returned for a row's id", () => {
      function createRow() {
        table.create({ id: '1', name: 'Thomas' });
      }

      // Monkey patch key function to return non string value.
      table._key = () => undefined;
      // Creating a row should always fail now.
      expect(createRow).to.throw;
    });
  });

  describe('createMany()', () => {
    it('should insert multiple rows', () => {
      const rows = [{ id: '1', name: 'Thomas' }, { id: '2', name: 'Jerry' }];
      const results = table.createMany(rows);
      const [rowOne, rowTwo] = results;
      expect(table._data['1']).to.deep.equal(rowOne);
      expect(table._data['2']).to.deep.equal(rowTwo);
    });
  });

  describe('read()', () => {
    beforeEach(() => {
      table.create(['1', 'Thomas', 'Fishing']);
      table.create(['2', 'Susy', 'Shopping']);
    });

    it('should get a row by id if supplied a scalar value', () => {
      // Should retrieve a row if it exists.
      const row = table.read('1');
      expect(row).to.deep.equal(table._data['1']);
      // Should return undefined if row does not exist.
      expect(table.read('3')).to.be.undefined;
    });
  });

  describe('readWhere()', () => {
    beforeEach(() => {
      table.create(['1', 'Thomas', 'Fishing']);
      table.create(['2', 'Susy', 'Shopping']);
    });

    it('should get rows that match a predicate if supplied a function', () => {
      const rows = table.readWhere((row) => row.name === 'Thomas');
      expect(rows).to.be.instanceOf(Array);
      expect(rows[0]).to.deep.equal(table._data['1']);
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      table.create(['1', 'Thomas', 'Fishing']);
      table.create(['2', 'Susy', 'Shopping']);
    });

    it('should update an existing row', () => {
      // Should update from an object.
      table.update({ id: 1, name: 'Thomas', hobby: 'Snowboarding' });
      expect(table._data['1']).to.deep.equal({ id: 1, name: 'Thomas', hobby: 'Snowboarding' });
    });

    it('should throw an error if a row does not exist', () => {
      function badUpdate() {
        table.update({ id: 3, name: 'Susy', hobby: 'Shopping' });
      }

      expect(badUpdate).to.throw;
    });
  });

  describe('updateMany()', () => {
    it('should update existing rows', () => {
      // Create test data.
      table.createMany([
        { id: 1, name: 'Thomas', hobby: 'Fishing' },
        { id: 2, name: 'Jerry', hobby: 'Surfing' },
      ]);

      // Should update from an array.
      table.updateMany([{ id: 1, hobby: 'Snowboarding' }, { id: 2, name: 'Susy' }]);

      // Assert that data was updated.
      expect(table._data['1']).to.deep.equal({ id: 1, name: 'Thomas', hobby: 'Snowboarding' });
      expect(table._data['2']).to.deep.equal({ id: 2, name: 'Susy', hobby: 'Surfing' });
    });
  });

  describe('delete()', () => {
    it('should delete a row by id', () => {
      table.create({ id: 1, name: 'Thomas', hobby: 'Fishing' });
      table.delete('1');
      expect(table._data['1']).to.not.exist;
    });
  });

  describe('deleteMany()', () => {
    it('should delete multiple rows by their ids', () => {
      table.createMany([
        { id: 1, name: 'Thomas', hobby: 'Fishing' },
        { id: 2, name: 'Jerry', hobby: 'Surfing' },
      ]);
      table.deleteMany(['1', '2']);
      expect(table._data['1']).to.not.exist;
      expect(table._data['2']).to.not.exist;
    });
  });

  describe('upsert()', () => {
    it('should update a row if it exists', () => {
      table.create({ id: 1, name: 'Thomas', hobby: 'Fishing' });
      const row = { id: 1, name: 'Thomas', hobby: 'Snowboarding' };
      table.upsert(row);
      expect(table._data['1']).to.deep.equal(row);
    });

    it('should create a row if it does not exist', () => {
      expect(table._data['1']).to.not.exist;
      const row = { id: 1, name: 'Thomas', hobby: 'Snowboarding' };
      table.upsert(row);
      expect(table._data['1']).to.deep.equal(row);
    });
  });

  describe('load()', () => {
    class DummyLoader extends Loader {
      constructor(data) {
        super();
        this._data = data;
      }

      *load() {
        for (const row of this._data) {
          yield row;
        }
      }
    }

    it('should load data from a loader', () => {
      const loader = new DummyLoader([['1', 'Thomas', 'Fishing'], ['2', 'Susy', 'Shopping']]);

      table.load(loader);

      expect(table._data['1']).to.deep.equal({ id: 1, name: 'Thomas', hobby: 'Fishing' });
      expect(table._data['2']).to.deep.equal({ id: 2, name: 'Susy', hobby: 'Shopping' });
    });
  });
});
