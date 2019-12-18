const path = require('path');

const { expect } = require('chai');

const { getLinesSync } = require('./getLinesSync');

describe('getLinesSync.js', () => {
  const testFileOne = path.join(process.cwd(), 'src', 'test', 'test_file_one.txt');

  it('should read all lines of a given input file, including empty lines', (done) => {
    const expectedLines = [
      'Lorem ipsum dolor sit amet,',
      'consectetur adipiscing elit.',
      '',
      'Duis egestas mauris at neque vehicula,',
      'vitae molestie libero ultrices.',
    ];
    const actualLines = [];

    for (const line of getLinesSync(testFileOne)) {
      actualLines.push(line);
    }

    expect(actualLines).to.deep.equal(expectedLines);

    done();
  });
});
