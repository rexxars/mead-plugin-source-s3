/* eslint-disable id-length, no-sync */
const fs = require('fs')
const path = require('path')
const test = require('tape')
const plugin = require('..')

const readStream = (stream, cb) => {
  const chunks = []
  stream
    .on('data', d => chunks.push(d))
    .on('error', cb)
    .on('end', () => cb(null, Buffer.concat(chunks)))
}

const configFile = path.join(__dirname, 'fixtures', 's3-mock.json')
const s3Source = plugin.handler
const bucket = 'mead-tests'

// Set options for integration tests
const s3Key = path.join(__dirname, 'fixtures', 's3-config.json')
const credentials = {}
const intOpts = {skip: true}
try {
  Object.assign(credentials, require(s3Key))
  intOpts.skip = false
} catch (e) {
  // Do nothing
}

test('has plugin props', t => {
  ['name', 'type', 'handler'].forEach(prop => {
    t.ok(plugin[prop])
  })
  t.end()
})

test('exposes source plugin props', t => {
  const src = s3Source({configFile, bucket})
  t.equal(typeof src.getImageStream, 'function', 'exposes `getImageStream()`')
  t.equal(typeof src.requiresSignedUrls, 'boolean', 'exposes `requiresSignedUrls`')
  t.end()
})

test('does not require signed urls by default', t => {
  t.notOk(s3Source({configFile, bucket}).requiresSignedUrls)
  t.end()
})

test('throws on missing `configFile` and keypair', t => {
  t.throws(() => s3Source({bucket}), /configFile/)
  t.end()
})

test('throws on missing keypair', t => {
  t.throws(() => s3Source({bucket}), /accessKeyId/)
  t.end()
})

test('throws on missing bucket', t => {
  t.throws(() => s3Source({configFile}), /bucket/)
  t.end()
})

test('returns stream that emits error on invalid credentials', t => {
  s3Source({bucket, configFile}).getImageStream('some/image.png', (err, stream) => {
    t.ifError(err, 'should not callback with error')
    readStream(stream, readErr => {
      t.ok(readErr instanceof Error, 'should error')
      t.end()
    })
  })
})

test('returns stream that retrieves a given image', intOpts, t => {
  const localBuf = fs.readFileSync(path.join(__dirname, 'fixtures', 'mead.png'))

  s3Source({bucket, configFile: s3Key, pathPrefix: '/photos/'})
    .getImageStream('logos/mead.png', (err, stream) => {
      t.ifError(err, 'should not callback with error')
      readStream(stream, (readErr, remoteBuf) => {
        t.ifError(readErr, 'should not error on read')
        t.equal(Buffer.compare(localBuf, remoteBuf), 0, 'Remote and local images should match')
        t.end()
      })
    })
})

test('can auth with credentials keypair', intOpts, t => {
  const localBuf = fs.readFileSync(path.join(__dirname, 'fixtures', 'mead.png'))

  s3Source(Object.assign({bucket, pathPrefix: '/photos/'}, credentials))
    .getImageStream('logos/mead.png', (err, stream) => {
      t.ifError(err, 'should not callback with error')
      readStream(stream, (readErr, remoteBuf) => {
        t.ifError(readErr, 'should not error on read')
        t.equal(Buffer.compare(localBuf, remoteBuf), 0, 'Remote and local images should match')
        t.end()
      })
    })
})
