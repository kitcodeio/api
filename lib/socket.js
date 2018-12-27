const Docker = require('dockerode');

const dbms = require('./db');
const Stats = require('./stats');

var stat = {};
var db = {};

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

module.exports = function(config) {
  stat = Stats(config);
  db = dbms(config);
  return (socket) => {
    socket.emit('ping', 'reality is an illusion');
    socket.on('kitcode', data => {
      stat.addClient(data, socket.id);
    });
    socket.on('info', (data) => {
      let container_id = data.id.replace('\n', '');
      if (!stat.getSocketId(container_id)) {
        db.updateEntry('Container', {
          where: {
            id: container_id
          }
        }, {
          state: 'active'
        });
        stat.addContainer(socket.id, container_id);
        stat.makeActive(container_id);
      } else socket.emit('close');
    });
    socket.on('disconnect', async () => {
      let entry_id = stat.getContainerId(socket.id);
      if (entry_id) {
        stat.rmContainer(socket.id);
        stat.makeIdle(entry_id);
        db.updateEntry('Container', {
          where: {
            id: entry_id
          }
        }, {
          state: 'idle'
        });
      } else {
	let id = stat.getSocketClients(socket.id);
        if (id) stat.removeClient(id, socket.id);
      }
    });
  }
}
