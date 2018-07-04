const Docker = require('dockerode');
const shelljs = require('shelljs');

const nginx = require('./nginx');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

module.exports = {
  createContainer: (subdomain) => {
    shelljs.exec('docker run -d kide:v2 bash start.sh ' + subdomain, function(code, output, error) {
      let container = docker.getContainer(output);
      container.inspect(function(err, data) {
        nginx.createVirtualHost(data.NetworkSettings.IPAddress, subdomain);
      });
    });
  }
};
