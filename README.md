# Webpack SSI Include Loader

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
                  location: 'https://your.website.com/',
                },
              },
            ],
          },
          ...
```
