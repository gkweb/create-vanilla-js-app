var assert = require('assert');
var path = require('path');
var fs = require('fs');
require('shelljs/global');

beforeEach(async function() {
  exec('rm -rf test/temp', {silent:true});
  exec('mkdir test/temp', {silent:true});
  exec('cd test/temp && cva demo1', {silent:true});
});

describe('CLI', function() {
  it('Can generate app boilerplate', function() {      
    var generatedEntryPointJs = fs.readFileSync(__dirname + '/temp/demo1/src/index.js', 'utf-8')

    assert.equal((generatedEntryPointJs.length > 1), true);
  });
});