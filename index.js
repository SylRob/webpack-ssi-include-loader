const SSI = require('./lib/ssi');

module.exports = function (source) {
  const ssi = new SSI(this.query);

  this.cacheable && this.cacheable();

  return ssi(source);
};
