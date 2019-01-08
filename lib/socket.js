'use strict';

module.exports = config => {
  const stat = require('./stats')(config);
  const db = require('./db')(config);
  return socket => {
    socket.emit('ping', 'reality is an illusion');
    socket.on('kitcode', data => {
      stat.addClient(data, socket.id);
    });
    socket.on('info', (data) => {
      let container_id = data.id.replace('\n', '');
      if (!stat.getSocketId(container_id)) {
        db.updateEntry('Container', {
          where: {
            id: container_id,
          },
        }, {
          state: 'active',
        });
        stat.addContainer(socket.id, container_id);
        stat.makeActive(container_id);
      } else socket.emit('close');
    });
    socket.on('kide:closed', async () => {
      let entry_id = stat.getContainerId(socket.id);
      if (entry_id) {
        stat.rmContainer(socket.id);
        stat.makeIdle(entry_id);
        db.updateEntry('Container', {
          where: {
            id: entry_id,
          },
        }, {
          state: 'idle',
        });
      }
    });
    socket.on('disconnect', async () => {
      let entry_id = stat.getContainerId(socket.id);
      let id = stat.getSocketClients(socket.id);
      if (id) stat.removeClient(id, socket.id);
      if (entry_id) {
        stat.rmContainer(socket.id);
        stat.makeIdle(entry_id);
        db.updateEntry('Container', {
          where: {
            id: entry_id,
          },
        }, {
          state: 'idle',
        });
      }
    });
  };
};
