const SSI = require('./lib/ssi');

module.exports = function (source) {
  const cb = this.async();
  const ssi = new SSI({
    ...this.query,
    onFileMatch: (filePath, fileContent, isLocal) => {
      if (fileContent && isLocal) {
        // so the file can be "watch" by webpack
        this.addDependency(filePath);
      }

      return this.query.onFileMatch && this.query.onFileMatch(filePath, fileContent, isLocal);
    },
  });

  this.cacheable && this.cacheable();
  ssi(source)
  .then((content) => {
    cb(null, content);
  })
  .catch((e) => {
    cb(e);
  });
};
