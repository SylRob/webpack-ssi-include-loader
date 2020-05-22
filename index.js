const SSI = require('./lib/ssi');

module.exports = function (source) {
  const cb = this.async();
  const ssi = new SSI(this.query);

  this.cacheable && this.cacheable();
  ssi(source)
  .then((content) => {
    cb(null, content);
  })
  .catch((e) => {
    cb(e, content);
  });
};
