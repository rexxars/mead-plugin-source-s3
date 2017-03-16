const AWS = require('aws-sdk')
const Boom = require('boom')

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

  function getImageStream(context, callback) {
    const urlPath = context.urlPath
    const imgPath = `${pathPrefix}/${urlPath}`.replace(/\/\//, '/')
    const stream = s3.getObject({Key: imgPath}).createReadStream()
      .once('readable', () => callback(null, stream))
      .on('error', err => callback(wrapError(err)))
  }
}

function wrapError(err) {
  if (err.code === 'NoSuchKey') {
    return Boom.notFound('Image not found')
  }

  return Boom.badImplementation(err)
}

module.exports = {
  name: 's3',
  type: 'source',
  handler: s3Source
}
