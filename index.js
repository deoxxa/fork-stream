var stream = require("stream");

var ForkStream = module.exports = function ForkStream(options) {
  options = options || {};

  options.objectMode = true;

  stream.Writable.call(this, options);

  if (options.classifier) {
    this._classifier = options.classifier;
  }

  this.a = new stream.Readable(options);
  this.b = new stream.Readable(options);

  this.a._read = function(n) {};
  this.b._read = function(n) {};
};
ForkStream.prototype = Object.create(stream.Writable.prototype, {constructor: {value: ForkStream}});

ForkStream.prototype._classifier = function(e, done) {
  return done(null, !!e);
};

ForkStream.prototype._write = function _write(input, encoding, done) {
  var self = this;

  this._classifier.call(null, input, function(err, res) {
    if (err) {
      return done(err);
    }

    var out = res ? self.a : self.b;

    if (out.push(input)) {
      return done();
    }

    return out.on("drain", done);
  });
};
