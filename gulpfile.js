var gulp = require('gulp');
var bump = require('gulp-bump');
var args = require('yargs').argv;
var Hapi = require('hapi');

var env = process.env.NODE_ENV || 'staging';

var plugin = require('./index')
var config = require('./config/config.json')[env];

var help = [
  '', '',
  '********************************************************************************',
  'missing options',
  'usage: npm run bump -- [options]',
  '',
  'options:',
  '  --type or -t           type of update: "major", "minor", "patch" or "prerelease"',
  '', '',
  'eg.   npm run bump -- -t patch',
  '********************************************************************************',
  '', ''
];

gulp.task('serve', function() {
  var server = new Hapi.Server();
  server.connection({
    host: config.server.api.host,
    port: config.server.api.port,
    routes: {
      cors: true
    }
  });
  plugin.register(server, {
    config: config
  }, async function() {
    await server.start();
    console.log('kitcode api server is online at http://' + config.server.api.host + ':' + config.server.api.port);
  });
});

gulp.task('update:version', function() {
  let type = args.t || args.type;
  if (type !== true && type !== false && type !== undefined) {

    if (type == 'major' || type == 'minor' || type == 'patch' || type == 'prerelease') {
      gulp.src('./package.json')
        .pipe(bump({
          type: type
        }))
        .pipe(gulp.dest('./'));
    } else {
      help[3] = 'wrong option: "' + type + '" is not a valid type';
      console.log(help.join('\n'));
    }
  } else {
    help[3] == 'missing option';
    console.log(help.join('\n'));
  }
});

gulp.task('set:enviroment', function() {
})
