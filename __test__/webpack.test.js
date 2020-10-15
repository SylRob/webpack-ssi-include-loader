const loader = require('../index');
const path = require('path');
const html = require('../__mocks__/html/simple-inc.html');

describe('Data from Webpack', () => {
  it('execute onFileMatch and return expected data', async () => {
    let result = {
      filePath: null,
      fileContent: null,
      isLocal: false,
    };
    const expectedResult = {
      filePath: path.join(__dirname, '../__mocks__/html/simple-inc.html'),
      fileContent: html,
      isLocal: true,
    };

    this.query = {
      localPath: path.join(__dirname, '../'),
      location: 'https://carservice.rakuten.co.jp/',
      onFileMatch: (filePath, fileContent, isLocal) => {
        result = {
          filePath,
          fileContent,
          isLocal
        };
      }
    };
    this.async = () => null;
    this.addDependency = () => null;

    const webpack = loader.bind(this);
    await webpack(`<!--#include virtual="__mocks__/html/simple-inc.html" -->`);

    expect(result).toEqual(expectedResult);
  });
});
