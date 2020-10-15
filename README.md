# Webpack SSI Include Loader

![NPM](https://img.shields.io/npm/l/webpack-ssi-include-loader) ![version](https://img.shields.io/github/v/release/SylRob/webpack-ssi-include-loader) ![GitHub last commit](https://img.shields.io/github/last-commit/SylRob/webpack-ssi-include-loader)

[![NPM](https://nodei.co/npm/webpack-ssi-include-loader.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/webpack-ssi-include-loader)


### Description
this package was created to help dev that have to work on with SSI and webpack.
it will help for setting a dev environment.

scan html content looking for pattern like :
```
<!--#include virtual="/your/path/file.html" -->
<!--#include file"/your/path/file.html" -->
```

if found any :
 - first look if the file can be found on the local machine, following the `localPath`
 - if not, try to find the file online following the `location` http url
 - if not, return an error message

### Usage
```
yarn add webpack-ssi-include-loader
```

```js
module: {
      rules: [
          ....
          {
            test: /\.html?$/,
            use: [
              {
                loader: 'html-loader', // Used to output as html
              },
              {
                loader: 'webpack-ssi-include-loader',
                options: {
                  localPath: path.join(__dirname, '/public'),
                  location: 'https://your.website.com/', // http url where the file can be dl
                },
              },
            ],
          },
          ...
```


### Parameters
| Parameters       | Type          | Default        | Description   |
| ---------------- |:-------------:|:--------------:| :------------ |
| location         | string        |                | http url where the file can be dl ex:'https://mywebsite.com/'  |
| localPath        | string        |                | path where the include files could be found ex: path.join(__dirname, '/public') |
| depthMax         | number        |    4           | how far should the SSI include should look for match within included files |
| disableLocalScan | boolean       |    false       | if you want the script to look only on the `location` url |
| includesMatcher  | regex         | /&lt;!--\s?#\s?include\s+(?:virtual&#124;file)=&quot;([^&quot;]+)&quot;?\s?--&gt;/ | regex of the matching string (don't touch unless you know what you are doing) |
| defaultCharset   | string        |    utf-8       | force the file reader to convert the file content into a specific charset |
| quietError       | boolean       |    false       | if the file cannot be found on local or online replace it with an error message or not |
| onFileMatch      | function      |    null        | callback on each SSI line match with 3 parameters : filePath&#60;string&#62;, fileContent&#60;string&#62;, isLocal&#60;boolean&#62;.<br> If you return a string it will override and replace the content |
| saveToDisk   | boolean        |    false       | saves files fetched online to disk (if not present) |
