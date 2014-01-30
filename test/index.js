
var Builder = require('component-builder');
var commonjs = Builder.commonjs;
var concat = Builder.concat
var exec = require('child_process').exec;
var assert = require('assert');
var jade = require('..');
var fs = require('fs');

/**
 * Api.
 */

describe('component-jade', function () {
  describe('string', function () {
    beforeEach(function () {
    builder = Builder(__dirname + '/fixtures/string');

      builder
      .use(jade('templates', { string: true }))
      .use(commonjs('templates'))
      .use(concat('templates'));
    });

    it('should have ext `.jade.html`', function (done) {
      builder.build(function (err, build) {
        if (err) throw err;
        assert.notEqual(build.templates.search('.jade.html'), -1);
        done();
      });
    });

    it('should convert jade to a string', function (done) {
      builder.build(function (err, build) {
        if (err) throw err;
        var input = build.templates.trim();
        var output = read('/string' + '/out.js').trim();
        assert.equal(input, output);
        done();
      });
    });
  })

  describe('template', function () {
    beforeEach(function () {
      builder = Builder(__dirname + '/fixtures/template');

      builder
      .use(jade('templates'))
      .use(commonjs('templates'))
      .use(concat('templates'))
    });

    it('should have `ext` .jade.js', function (done) {
      builder.build(function (err, build) {
        if (err) throw err;
        assert.notEqual(build.templates.search('.jade.js'), -1);
        done();
      });
    });

    it('should convert jade to a template', function (done) {
      builder.build(function (err, build) {
        if (err) throw err;
        var input = build.templates.trim();
        var output = read('/template' + '/out.js').trim();
        assert.equal(input, output);
        done();
      });
    });
  });
});

/**
 * Read fixture.
 *
 * @param {String} fixture
 */

function read (fixture) {
  return fs.readFileSync(__dirname + '/fixtures' + fixture, 'utf-8');
}
