var inherits = require('inherits')
var stream = require('readable-stream')
var pr = require('./process')

inherits(CompactStream, stream.Transform)

function CompactStream () {
    if (!(this instanceof CompactStream)) {
        return new CompactStream()
    }

    stream.Transform.call(this)

    this.exitCode = 0
    this._buffer = []
}

CompactStream.prototype._transform = function (chunk, encoding, cb) {
    this._buffer.push(chunk)
    cb(null)
}

CompactStream.prototype._flush = function (cb) {
    var lines = Buffer.concat(this._buffer).toString()
    var output = pr(lines.split('\n'));
    this.exitCode = output === '' ? 0 : 1
    cb()
}


module.exports = CompactStream