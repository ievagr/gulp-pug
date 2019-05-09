'use strict';

const test = require('tap').test;

const plugin = require('../');

const path = require('path');
const fs = require('fs');
const Vinyl = require('vinyl');
const pug = require('pug');
const miss = require('mississippi');

const filePath = path.join(__dirname, 'fixtures', 'helloworld.pug');
const fileContents = fs.readFileSync(filePath);
const base = path.join(__dirname, 'fixtures');
const cwd = __dirname;

const file = new Vinyl({
  path: filePath,
  base: base,
  cwd: cwd,
  contents: fs.createReadStream(filePath),
});

test('should error if contents is a stream', function(t) {
  function assert(files) {
    /* eslint no-console: 0 */
    var expected = pug.compile(fileContents)();
    t.ok(files[0]);
    t.equals(expected, String(files[0].contents));
  }

  miss.pipe([
    miss.from.obj([file]),
    plugin(),
    miss.concat(assert),
  ], t.end);
});
