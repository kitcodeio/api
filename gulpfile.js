var gulp = require('gulp');
var Hapi = require('hapi');
var env = process.env.NODE_ENV || 'staging';
var plugin = require('./index')
var config = require('./config/config.json')[env];
var server = new Hapi.Server();

gulp.task('serve', function() {
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
