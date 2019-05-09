'use strict';

const through = require('through2');
const defaultPug = require('pug');
const ext = require('replace-ext');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const bl = require('bl');
const stream = require('readable-stream');

module.exports = function gulpPug(options) {
  const opts = Object.assign({}, options);
  const pug = opts.pug || opts.jade || defaultPug;

  opts.data = Object.assign(opts.data || {}, opts.locals || {});

  return through.obj(function compilePug(file, enc, cb) {
    const data = Object.assign({}, opts.data, file.data || {});

    opts.filename = file.path;
    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if (file.isStream()) {
      stream.pipeline([
        file.contents,
        bl(function(err, contents) {
          if (err) {
            return onError(err);
          }

          compile(String(contents));
        }),
      ], function(err) {
        if (err) {
          return onError(err);
        }
      });
      return;
    }

    if (file.isBuffer()) {
      const contents = String(file.contents);
      compile(contents);
      return;
    }

    function compile(contents) {
      try {
        let compiled;

        if (opts.verbose === true) {
          log('compiling file', file.path);
        }
        if (opts.client) {
          compiled = pug.compileClient(contents, opts);
        } else {
          compiled = pug.compile(contents, opts)(data);
        }
        file.contents = new Buffer(compiled);
      } catch (e) {
        return onError(e);
      }
      cb(null, file);
    }

    function onError(err) {
      cb(new PluginError('gulp-pug', err));
    }
  });
};
