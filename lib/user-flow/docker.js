const Docker = require('dockerode');

const nginx = require('./nginx');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

module.exports = {
  createContainer: (user) => {
    docker.createContainer({
      Image: 'kide:v2',
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Tty: false,
      Cmd: ['/bin/bash', 'start.sh'],
      OpenStdin: false,
      StdinOnce: false
    }).then(function(container) {
      return container.start();
    }).then(function(container) {
      container.inspect(function(err, data) {
        nginx.createVirtualHost(data.NetworkSettings.IPAddress,user);
      });
    });
  }
};
