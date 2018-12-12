#!/usr/bin/env node

var program = require('commander');
var mkdirp = require('mkdirp');
var os = require('os');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var sortedObject = require('sorted-object');

var _exit = process.exit;
var eol = os.EOL;
var pkg = require('../package.json');

var version = pkg.version;

// Re-assign process.exit because of commander
process.exit = exit

// CLI

before(program, 'outputHelp', function () {
  this.allowUnknownOption();
});

program
  .version(version)
  .usage('[options] [dir]')
  .option('    --git', 'add .gitignore')
  .option('-f, --force', 'force on non-empty directory')
  .parse(process.argv);

if (!exit.exited) {
  main();
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
  var old = obj[method];

  obj[method] = function () {
    fn.call(this);
    old.apply(this, arguments);
  };
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm(msg, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(msg, function (input) {
    rl.close();
    callback(/^y|yes|ok|true$/i.test(input));
  });
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication(app_name, path) {
  var wait = 5;

  console.log();
  function complete() {
    if (--wait) return;
    var prompt = launchedFromCmd() ? '>' : '$';

    console.log();
    console.log('   install dependencies:');
    console.log('     %s cd %s && yarn', prompt, path);
    console.log();
    console.log('   run as development:');
    console.log('    %s yarn run start:dev', prompt, app_name);

    console.log();
  }

  // JavaScript
  var entry = loadTemplate('src/index.js');
  var markup = loadTemplate('public/index.html');
  var webpackConfig = loadTemplate('webpack.config.js');
  var appComponentStyle = loadTemplate('src/components/app/index.css');
  var appComponent = loadTemplate('src/components/app/index.js');
  var editorConfig = loadTemplate('.editorconfig');
  var npmRc = loadTemplate('npmrc');
  var readMe = loadTemplate('README.md');

  mkdir(path, function(){
    mkdir(path + '/src');
    mkdir(path + '/src/components', function() {
        mkdir(path + '/src/components/app');
        mkdir(path + '/public');
        mkdir(path + '/public/bundle');

        // package.json
        var pkg = {
            name: app_name
        , version: '0.1.0'
        , private: true
        , "scripts": {
            "build": "webpack-cli",
            "start:dev": "NODE_ENV=development webpack-dev-server",
            "test": "echo \"Error: no test specified\" && exit 1"
        }
        , "dependencies": {}
        , "devDependencies": {
            "babel-cli": "^6.26.0",
            "babel-core": "^6.26.0",
            "babel-loader": "^7.1.0",
            "babel-preset-env": "^1.7.0",
            "webpack": "^4.16.0",
            "webpack-cli": "^3.0.0",
            "webpack-dev-server": "^3.1.0",
            "css-loader": "^2.0.0",
            "style-loader": "^0.23.0"
            }
        }

        // sort dependencies like npm(1)
        pkg.dependencies = sortedObject(pkg.dependencies);

        // write files
        write(path + '/README.md', readMe);
        write(path + '/package.json', JSON.stringify(pkg, null, 2));
        write(path + '/src/index.js', entry);
        write(path + '/.editorconfig', editorConfig);
        write(path + '/.npmrc', npmRc);
        write(path + '/src/components/app/index.css', appComponentStyle);
        write(path + '/src/components/app/index.js', appComponent);
        write(path + '/public/index.html', markup);
        write(path + '/webpack.config.js', webpackConfig);

        if (program.git) {
          write(path + '/.gitignore', fs.readFileSync(__dirname + '/../templates/gitignore', 'utf-8'));
        }

        complete();
    });
    complete();
  });
}

function copy_template(from, to) {
  from = path.join(__dirname, '..', 'templates', from);
  write(to, fs.readFileSync(from, 'utf-8'));
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
  fs.readdir(path, function(err, files){
    if (err && 'ENOENT' != err.code) throw err;
    fn(!files || !files.length);
  });
}

/**
 * Graceful exit for async STDIO
 */

function exit(code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done() {
    if (!(draining--)) _exit(code);
  }

  var draining = 0;
  var streams = [process.stdout, process.stderr];

  exit.exited = true;

  streams.forEach(function(stream){
    // submit empty write request and wait for completion
    draining += 1;
    stream.write('', done);
  });

  done();
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
  return process.platform === 'win32'
    && process.env._ === undefined;
}

/**
 * Load template file.
 */

function loadTemplate(name) {
    console.log(name)
  return fs.readFileSync(path.join(__dirname, '..', 'templates', name), 'utf-8');
}

/**
 * Main program.
 */

function main() {
  // Path
  var destinationPath = program.args.shift() || '.';

  // App name
  var appName = path.basename(path.resolve(destinationPath));

  // Generate application
  emptyDirectory(destinationPath, function (empty) {
    if (empty || program.force) {
      createApplication(appName, destinationPath);
    } else {
      confirm('destination is not empty, continue? [y/N] ', function (ok) {
        if (ok) {
          process.stdin.destroy();
          createApplication(appName, destinationPath);
        } else {
          console.error('aborting');
          exit(1);
        }
      });
    }
  });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
  console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
  mkdirp(path, 0755, function(err){
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}