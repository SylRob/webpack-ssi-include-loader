const request = require('then-request');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const fs = require('fs');

/**
 * take HTLM string scan it to find ssi include string
 * <!--#include virtual="*****" --> or <!--#include file="*****" -->
 *
 * @param  {string} param.location ex:'https://mywebsite.com/'
 * @param  {string} param.localPath ex:path.join(__dirname, '/public')
 * @param  {number} [param.depthMax=4] how far should the SSI include should look for match withing inluded files
 * @param  {boolean} [param.disableLocalScan=false] if you want the script to look only on the `param.location` url
 * @param  {regex} [param.includesMatcher=/<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s?-->/] regex of the matching string (don't touch unless you know what you are doing)
 * @param  {string} [param.defaultCharset='utf-8'] force the file reader to convert the file content into a specific charset
 * @param  {string} [param.quietError=false] if the file cannot be found on local or online replace it with an error message or not
 * @param  {matchCb} [param.onFileMatch=null] callback on each SSI line match
 *
 * @return {string} formated HTML with the SSI include files content
 */
const SSI = function (param) {
  const defaultOptions = {
    depthMax: 4,
    disableLocalScan: false,
    includesMatcher: /<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s?-->/,
    onFileMatch: () => null,
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
      const filePath = `${options.localPath}${location}`;
      const fileBuffer = options.localPath && !matches && !options.disableLocalScan && fs.readFileSync(filePath);
      const content = iconv.decode(fileBuffer, options.defaultCharset || 'utf-8')

      const modifiedContent = options.onFileMatch(filePath, content, true);


      return modifiedContent || content;
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
      let content = options.quietError ? '' : `ERROR : could not find the file ${location}`;
      if (res && res.statusCode && res.statusCode < 400) {
        content = iconv.decode(res.body, charset);
      }

      const modifiedContent = options.onFileMatch(url, content, false);
      return modifiedContent || content;
    } catch(e) {
      console.error(e);
      return options.quietError ? '' : `ERROR : could not find the file ${location}`;
    }
  }

  async function processInclude(part, i) {
    const matches = part.match(options.includesMatcher);
    if (!matches) {
      return part;
    }

    const ssiString = matches[0];
    const location = matches[1];

    const body = await getContent(location);
    if(i >= options.depthMax) return body;
    else return await compile(body, i + 1);
  }

  async function compile(content, i = 0) {
    let output = [];
    const splitContent = content.split('\n');
    // eslint-disable-next-line
    for (const line of splitContent) {
      const part = line.trim();
      output += await processInclude(part, i);
    }

    return output;
  }

  return (content) => compile(content);
};

/**
 * This callback is displayed as a global member.
 * @callback matchCb
 * @param {string} filePath path of the file or URL of the file
 * @param {string} fileContent
 * @param {boolean} isLocal if the file is local return true
 */

module.exports = SSI;
