const AWS = require('aws-sdk')

function s3Source(config) {
  const {configFile, accessKeyId, secretAccessKey, bucket} = config
  const hasKeyPair = accessKeyId && secretAccessKey
  const pathPrefix = (config.pathPrefix || '').replace(/^\/|\/$/g, '')

  if (!hasKeyPair && !configFile) {
    throw new Error(
      'S3 sources need either a `configFile` or both `accessKeyId` and `secretAccessKey`'
    )
  }

  if (!bucket) {
    throw new Error('S3 sources need a `bucket` property')
  }

  const s3 = new AWS.S3({params: {Bucket: bucket}})
  if (hasKeyPair) {
    s3.config.update({accessKeyId, secretAccessKey})
  } else {
    s3.config.loadFromPath(configFile)
  }

  return {getImageStream, requiresSignedUrls: false}

  function getImageStream(urlPath, callback) {
    const imgPath = `${pathPrefix}/${urlPath}`.replace(/\/\//, '/')
    setImmediate(callback, null, s3.getObject({Key: imgPath}).createReadStream())
  }
}


module.exports = {
  name: 's3',
  type: 'source',
  handler: s3Source
}
