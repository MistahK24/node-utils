const path = require('path');

const { expect } = require('chai');

const { CsvLoader } = require('./loaders');

const testDataPath = path.join(process.cwd(), 'src', 'test', 'test_data.csv');
const testDataWithNewlinePath = path.join(
  process.cwd(),
  'src',
  'test',
  'test_data_with_newline.csv',
);

describe('loaders', () => {
  const expectedTestData = [
    ['1', 'Luke', '24', '"11620 Apple Street, Wenatchee, WA"'],
    ['2', 'Becky', '20', '"ABC Street, New York, NY"'],
    ['3', 'Tom', '70', 'Somewhere in Idaho'],
    ['4', 'Becky', '20', ''],
  ];
  const expectedTestDataWithNewline = [
    ['1', 'Luke', '24', '"\n11620 Apple Street, \nWenatchee, WA"'],
    ['2', 'Becky', '20', '"\nABC Street, \nNew York, NY\n"'],
    ['3', 'Tom', '70', 'Somewhere in Idaho'],
    ['4', 'Becky', '20', ''],
  ];

  describe('CsvLoader', () => {
    describe('constructor()', () => {
      it('should require a csv file', () => {
        throw Error('Not Implemented');
      });
    });

    describe('load()', () => {
      it('should return a generator', () => {
        throw Error('Not Implemented');
      });

      it('should read all lines', () => {
        // First test file without newlines.
        let loader = new CsvLoader({ csvFile: testDataPath });
        let results = [];

        for (const row of loader.load()) {
          results.push(row);
        }

        expect(results).to.deep.equal(expectedTestData);

        // Now test with newlines.
        loader = new CsvLoader({ csvFile: testDataWithNewlinePath });
        results = [];

        for (const row of loader.load()) {
          results.push(row);
        }

        expect(results).to.deep.equal(expectedTestDataWithNewline);
      });

      it('should skip headers', () => {
        throw Error('Not Implemented');
      });

      it('should pop off the last line if empty', () => {
        throw Error('Not Implemented');
      });

      it('should read all lines of a file with newlines', () => {
        throw Error('Not Implemented');
      });

      it('should escape new lines', () => {
        throw Error('Not Implemented');
      });

      it('should escape delimiters', () => {
        throw Error('Not Implemented');
      });
    });
  });
});
