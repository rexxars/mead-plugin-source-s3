# mead-plugin-source-s3

[![npm version](http://img.shields.io/npm/v/mead-plugin-source-s3.svg?style=flat-square)](http://browsenpm.org/package/mead-plugin-source-s3)[![Build Status](http://img.shields.io/travis/rexxars/mead-plugin-source-s3/master.svg?style=flat-square)](https://travis-ci.org/rexxars/mead-plugin-source-s3)[![Coverage Status](https://img.shields.io/coveralls/rexxars/mead-plugin-source-s3/master.svg?style=flat-square)](https://coveralls.io/github/rexxars/mead-plugin-source-s3)[![Dependency status](https://img.shields.io/david/rexxars/mead-plugin-source-s3.svg?style=flat-square)](https://david-dm.org/rexxars/mead-plugin-source-s3)

S3 source for the Mead image transformer service - loads images from an S3 bucket.

## Installation

```shell
npm install --save mead-plugin-source-s3
```

## Usage

Your mead configuration file (`mead --config <path-to-config.js>`):

```js
module.exports = {
  // Load the plugin
  plugins: [
    require('mead-plugin-source-s3')
  ],

  // Define a source using S3
  sources: [{
    name: 'my-s3-source',
    adapter: {
      type: 's3',
      config: {
        pathPrefix: 'photos', // Optional
        bucket: 'my-bucket-name',

        // Either provide `configFile` or both `accessKeyId` and `secretAccessKey`
        configFile: '/path/to/s3-key.json'
      }
    }
  }]
}
```

## License

MIT-licensed. See LICENSE.
