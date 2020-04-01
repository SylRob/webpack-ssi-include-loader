# Webpack SSI Include Loader

### Description
this package was created to help dev that have to work on with SSI and webpack.
it will help for setting a dev environment.

scan html content looking for pattern like :
`<!--#include virtual="/your/path/file.html" -->`
if found any :
 - first look if the file can be found on the local machine, following the `localPath`
 - if not, try to find the file online following the `location` http url
 - if not, return an error message

### Usage
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
                  localPath: path.join(__dirname, '/public'), // path where the include find could be found
                  location: 'https://your.website.com/', // http url where the file can be dl
                },
              },
            ],
          },
          ...
```
