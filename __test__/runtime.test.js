const ssi = require('../lib/ssi');
const path = require('path');
const html = require('../__mocks__/html/dummy.html');

beforeAll(() => {

});

describe('Process performances', () => {
  it('should load faster than the minimum on "my" mahcine', async () => {
    const ssiFn = ssi({
      localPath: path.join(__dirname, '../'),
      location: 'https://carservice.rakuten.co.jp/',
    });

    const timerStart = Date.now();
    await ssiFn(html);
    const timerDiff = Date.now() - timerStart;

    // time is just an avarage of my machine
    expect(timerDiff).toBeLessThanOrEqual(250);
  });
});
