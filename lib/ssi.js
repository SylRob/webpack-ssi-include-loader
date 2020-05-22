const request = require('then-request');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const fs = require('fs');

const SSI = function (param) {
  const options = param;
  options.includesMatcher = /<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s?-->/;

  function extractCharSet(httpCall) {
    const tempChar = chardet.detect(httpCall.body);
    return tempChar || 'utf-8';
  }

  async function getContent(location) {
    let url;
    // if the location is already a correct http url
    const urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    const matches = location.match(urlPattern);

    // if the location is not a http URL, lets try to find the file on local first
    try {
      if (options.localPath && !matches) {
        const fileBuffer = fs.readFileSync(`${options.localPath}${location}`);
        return [200, iconv.decode(fileBuffer, options.defaultCharset || 'utf-8')];
      }
    } catch (e) {
      // if it is a http URL lets use it like that
      if (matches) {
        url = location;
      } else {
        // if nothing match let generate an URL with the provided base url
        url = `${options.location.charAt(options.location.length - 1) === '/' ? options.location.substring(0, options.location.length - 1) : options.location}${location}`;
      }

      const res = await request('GET', url);
      if (!res || !res.statusCode || res.statusCode >= 400) {
        return [200, `ERROR : ${location}`];
      }

      const charset = extractCharSet(res);
      return [res.statusCode, iconv.decode(res.body, charset)];
    } // catch (e)
  }

  async function processInclude(part, blocks) {
    const matches = part.match(options.includesMatcher);
    if (!matches) {
      return part;
    }

    const location = matches[1];
    const stub = matches[2];

    const [status, body] = await getContent(location);
    return status === 200 ? body : blocks[stub];
  }

  async function compile(content) {
    let output = [];
    const blocks = {};
    const splitContent = content.split('\n');
    // eslint-disable-next-line
    for (const line of splitContent) {
      const part = line.trim();
      output += await processInclude(part, blocks);
    }

    return output;
  }

  return (content) => compile(content);
};

module.exports = SSI;
