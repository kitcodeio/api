const shelljs = require('shelljs');
const Docker = require('dockerode');

const db = require('./db');
const stat = require('./stats');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

module.exports = (socket) => {

  socket.on('info', (data) => {
    let container_id = data.id.replace('\n', '');
    if (!stat.getSocketId(container_id))
      stat.addContainer(socket.id, container_id);
    else {
      console.log('avi close hoga');
      socket.emit('close');
    }
  });

  socket.on('disconnect', async () => {
    let entry_id = stat.getContainerId(socket.id);
    if (entry_id) {
      console.log(entry_id);
      let result = await db.readEntry('Container', 'findAll', {
        where: {
          id: entry_id
        }
      });
      let container_id = result.entity[0].toJSON().container_id;
      let subdomain = result.entity[0].toJSON().subdomain;
      shelljs.exec('docker commit ' + container_id + ' ' + container_id, {
        silent: true
      }, (code, output, err) => {
        stat.rmContainer(socket.id);
        let container = docker.getContainer(container_id);
        container.stop(() => {
          container.remove(async () => {
            let update = await db.updateEntry('Container', {
              where: {
                id: entry_id
              }
            }, {
              active: false
            });
            let domain = await db.updateEntry('Subdomain', {
              where: {
                salt: subdomain
              }
            }, {
              occupied: false
            });
          })
        });
      });
    }
  });
}
