const request = require('then-request');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const fs = require('fs');

/**
 * take HTLM string scan it to find ssi include string
 * <!--#include virtual="*****" -->
 *
 * @param  {Object} param shape like :
 * {
 *   location type:string ex:'https://mywebsite.com/'
 *   localPath type:string ex:path.join(__dirname, '/public')
 *   depthMax type?:number default: 4 // how far should the SSI include should look for match withing inluded files
 *   includesMatcher type?: string default: /<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s?-->/ // regex of the matching string (don't touch unless you know what you are doing)
 * }
 * @return {string} // formated HTML with the SSI include files content
 */
const SSI = function (param) {
  const defaultOptions = {
    depthMax: 5,
    includesMatcher: /<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s?-->/,
  }
  const options = {
    ...defaultOptions,
    ...param,
  };

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
      if (options.localPath && !matches && !options.disableLocalScan) {
        const fileBuffer = fs.readFileSync(`${options.localPath}${location}`);
        return iconv.decode(fileBuffer, options.defaultCharset || 'utf-8');
      }
    } catch (e) {
      // if it is a http URL lets use it like that
      if (matches) {
        url = location;
      } else {
        // if nothing match let generate an URL with the provided base url
        url = `${options.location.charAt(options.location.length - 1) === '/' ? options.location.substring(0, options.location.length - 1) : options.location}${location}`;
      }

      return getContentOnline(url, location);
    } // catch (e)
  }

  async function getContentOnline(url, location) {
    try {
      const res = await request('GET', url);
      const charset = extractCharSet(res);
      if (!res || !res.statusCode || res.statusCode >= 400) {
        return `ERROR : could not find the file ${location}`;
      }
      return iconv.decode(res.body, charset);
    } catch(e) {
      console.error(e);
      return `ERROR : could not find the file ${location}`;
    }
  }

  async function processInclude(part, content, i) {
    const matches = part.match(options.includesMatcher);
    if (!matches) {
      return content + part;
    }

    const ssiString = matches[0];
    const location = matches[1];

    const body = await getContent(location);
    const formatedContent = content + part.replace(ssiString, '');
    if(i >= options.depthMax) return formatedContent + body;
    else return await processInclude(body, formatedContent, i + 1);
  }

  async function compile(content) {
    let output = [];
    const splitContent = content.split('\n');
    // eslint-disable-next-line
    for (const line of splitContent) {
      const part = line.trim();
      output += await processInclude(part, '', 0);
    }

    return output;
  }

  return (content) => compile(content);
};

module.exports = SSI;
