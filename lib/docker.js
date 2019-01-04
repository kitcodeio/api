'use strict';

const Docker = require('dockerode');
const shelljs = require('shelljs');
const request = require('request-promise-native');

const docker = new Docker();

module.exports = (config, stat) => {
  const db = require('./db')(config);
  const { host, port } = config.server.run;
  return {
    async buildImage(id, user_id, io) {
      return new Promise((resolve, reject) => {
        docker.buildImage({
          context: __dirname + '/../dockerfiles',
          src: ['Dockerfile']
        }, {
          t: id + ""
        }, (err, stream) => {
          if (err || !stream) {
            db.deleteEntry('Image', id);
            return resolve({
              error: err,
              statusCode: 422
            });
          } else {
            docker.modem.followProgress(stream, (err, res) => {
              if (err) db.deleteEntry('Image', id);
              stat.getClientSockets(user_id).forEach(id => {
                let remote = io.sockets.connected[id];
                if (remote) remote.emit('result', err);
              });
            }, evt => {
              if (evt.stream)
                if (evt.stream !== '\n') {
                  stat.getClientSockets(user_id).forEach(id => {
                    let remote = io.sockets.connected[id];
                    if (remote) remote.emit('show', evt.stream);
                  });
                }
            });
            return resolve({
              statusCode: 200
            });
          }
        });
      });
    },
    async startContainer(entry_id, container_id, salt) {
      let data = await request.post({
        uri: 'http://' + host + ':' + port + '/start',
        form: {
          image_id: container_id,
          subdomain: salt
        }
      }).catch(err => console.log(err));
      if (!data) return {
        statusCode: 500
      };
      data = JSON.parse(data);
      if (data.statusCode == 500) return data;
      let newContainer = await db.updateEntry('Container', {
        where: {
          id: entry_id
        }
      }, {
        container_id: data.Config.Hostname,
        state: 'idle',
        ip: data.NetworkSettings.IPAddress,
        subdomain: salt,
        image_id: container_id.includes('-') ? null : container_id
      });
      let domain = await db.updateEntry('Subdomain', {
        where: {
          salt: salt
        }
      }, {
        occupied: true
      });
      if (newContainer.statusCode == 200 && domain.statusCode == 200) {
        stat.makeIdle(entry_id);
        return {
          statusCode: 200,
          entity: {
            container_id: entry_id,
            subdomain: salt
          }
        }
      } else return {
        statusCode: 500,
        error: 'try again later, while we fire the dev'
      }
    },
    async stopContainer(entry_id) {
      let result = await db.readEntry('Container', 'findOne', {
        where: {
          id: entry_id
        }
      });
      let { container_id, image_id, subdomain } = result.entity.toJSON();
      let response = await request.post({
        uri: 'http://' + host + ':' + port + '/stop',
        form: {
          container_id,
          subdomain,
          subdomain
        }
      }).catch(err => console.log(err));
      if (!response) return;
      let update = await db.updateEntry('Container', {
        where: {
          id: entry_id
        }
      }, {
        state: 'closed'
      });
      let domain = await db.updateEntry('Subdomain', {
        where: {
          salt: subdomain
        }
      }, {
        occupied: false
      });
    }
  }
}
