const loader = require('../index');
const path = require('path');
const html = require('../__mocks__/html/simple-inc.html');

describe('Data from Webpack', () => {

  // set the webpack prework
  this.query = {
    localPath: path.join(__dirname, '../'),
    location: 'https://carservice.rakuten.co.jp/',
  };

  beforeEach(() => {
    this.addDependency = () => null;
    this.async = () => () => null;
  });

  const webpack = loader.bind(this);

  it('should find SSI line and import expected data', async () => {
    let result = null;

    await new Promise((resolve) => {
      this.async = () => (error, data) => {
        result = data;
        resolve();
      };
      webpack(`<!--#include virtual="__mocks__/html/simple-inc.html" -->`);
    });
    
    expect(result).toEqual(html);
  });

  it('should execute onFileMatch and return expected data', async () => {
    let cb = {
      filePath: null,
      fileContent: null,
      isLocal: false,
    };
    const expectedResult = {
      filePath: path.join(__dirname, '../__mocks__/html/simple-inc.html'),
      fileContent: html,
      isLocal: true,
    };

    await new Promise((resolve) => {
      this.query.onFileMatch = (filePath, fileContent, isLocal) => {
        cb = {
          filePath,
          fileContent,
          isLocal
        };

        resolve();
      };

      webpack(`<!--#include virtual="__mocks__/html/simple-inc.html" -->`);
    });

    expect(cb).toEqual(expectedResult);
  });
});
