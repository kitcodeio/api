'use strict';

const Docker = require('dockerode');
const shelljs = require('shelljs');
const docker = new Docker();

module.exports = (config, stat) => {
  const db = require('./db')(config);
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
      let image = await docker.getImage(container_id).inspect().catch(() => {});
      if (!image) return {
        statusCode: 500,
        error: 'image does not exist'
      };
      let container = await docker.createContainer({
        Image: container_id,
        Cmd: ['/bin/bash', '/kide/start.sh']
      });
      await container.start();
      let data = await container.inspect();
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
        shelljs.exec("sudo bash " + __dirname + "/virtualhost.sh " + salt + " " + data.NetworkSettings.IPAddress, {
          silent: true
        });
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
      let container_id = result.entity.toJSON().container_id;
      let image_id = result.entity.toJSON().image_id;
      let subdomain = result.entity.toJSON().subdomain;
      let container = docker.getContainer(container_id);
      let data = await container.inspect();
      await container.stop();
      await container.commit({
        repo: data.Config.Hostname
      });
      await container.remove();
      if (image_id) docker.getImage(image_id).remove();
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
      shelljs.exec("sudo bash " + __dirname + "/delete-virtualhost.sh " + subdomain, {
        silent: true
      });
    }
  }
}
