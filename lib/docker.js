'use strict';

const io = require('socket.io-client');
const request = require('request-promise-native');

module.exports = (config, stat) => {
  const db = require('./db')(config);
  const { host, port, } = config.server.run;
  return {
    async buildImage(id, user_id, modules, clients, tutorial_id) {
      return new Promise((resolve, reject) => {
        let socket = io('http://' + host + ':' + port);
        socket.emit('build:image', { id, modules, });
        socket.on('build:init', res => {
          if (res.statusCode !== 200) {
            db.deleteEntry('Image', id);
            return resolve({
              error: res.error,
              statusCode: 422,
            });
          } else return resolve({
            statusCode: 200,
          });
        });
        socket.on('build:evt', evt => {
          if (stat) stat.getClientSockets(user_id).forEach(id => {
            if (clinets) {
              let remote = clients.sockets.connected[id];
              if (remote) remote.emit('show', evt);
            }
          });
        });
        socket.on('build:result', res => {
          if (res.statusCode !== 200) {
            db.deleteEntry('Image', id);
            if (tutorial_id) db.updateEntry('Tutorial', {
              where: {
                id: tutorial_id
              }
            }, {
              status: 'error in building image'
            });
          }
          if (res.statusCode == 200 && tutorial_id) db.updateEntry('Tutorial', {
            where: {
              id: tutorial_id
            }
          }, {
            approved: true,
            status: 'live'
          });
          if (stat) stat.getClientSockets(user_id).forEach(id => {
            if (clients) {
              let remote = clients.sockets.connected[id];
              if (remote) remote.emit('result', res.error);
            }
          });
        });
      });
    },
    async removeImage(entry_id){
      let data = await request.post({
        uri: 'http://' + host + ':' + port + '/image/remove',
        form: {
	  image_id: entry_id
	}
      }).catch(err => console.error(err));
      if (!data) return {
        statusCode: 500
      };
      data = JSON.parse(data);
      if (data.statusCode == 500) return data;
      let result = await db.deleteEntry('Image', entry_id);
      return result;
    },
    async startContainer(entry_id, container_id, salt) {
      let data = await request.post({
        uri: 'http://' + host + ':' + port + '/start',
        form: {
          image_id: container_id,
          subdomain: salt,
        },
      }).catch(err => console.log(err));
      if (!data) return {
        statusCode: 500,
      };
      data = JSON.parse(data);
      if (data.statusCode == 500) return data;
      let newContainer = await db.updateEntry('Container', {
        where: {
          id: entry_id,
        },
      }, {
        container_id: data.Config.Hostname,
        state: 'idle',
        ip: data.NetworkSettings.IPAddress,
        subdomain: salt,
        image_id: container_id.includes('-') ? null : container_id,
      });
      let domain = await db.updateEntry('Subdomain', {
        where: {
          salt: salt,
        },
      }, {
        occupied: true,
      });
      if (newContainer.statusCode == 200 && domain.statusCode == 200) {
        stat.makeIdle(entry_id);
        return {
          statusCode: 200,
          entity: {
            container_id: entry_id,
            subdomain: salt,
          },
        };
      } else return {
        statusCode: 500,
        error: 'try again later, while we fire the dev',
      };
    },
    async stopContainer(entry_id) {
      let result = await db.readEntry('Container', 'findOne', {
        where: {
          id: entry_id,
        },
      });
      let { container_id, image_id, subdomain, } = result.entity.toJSON();
      let response = await request.post({
        uri: 'http://' + host + ':' + port + '/stop',
        form: {
          container_id,
          subdomain,
          subdomain,
        },
      }).catch(err => console.log(err));
      if (!response) return;
      let update = await db.updateEntry('Container', {
        where: {
          id: entry_id,
        },
      }, {
        state: 'closed',
      });
      let domain = await db.updateEntry('Subdomain', {
        where: {
          salt: subdomain,
        },
      }, {
        occupied: false,
      });
    },
  };
};
