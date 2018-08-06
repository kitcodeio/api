const Docker = require('dockerode');
const shelljs = require('shelljs');

const db = require('./db');

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

var activeContainers = {};
var activeSockets = {};
var idleContainers = {};

async function closeContainer(entry_id) {
  let result = await db.readEntry('Container', 'findAll', {
    where: {
      id: entry_id
    }
  });
  let container_id = result.entity[0].toJSON().container_id;
  let image_id = result.entity[0].toJSON().image_id;
  let subdomain = result.entity[0].toJSON().subdomain;
  shelljs.exec('docker commit ' + container_id + ' ' + container_id, {
    silent: true
  }, (code, output, err) => {
    let container = docker.getContainer(container_id);
    container.stop(() => {
      container.remove(async () => {
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
	shelljs.exec("sudo bash "+__dirname+"/delete-virtualhost.sh "+subdomain, {
	  silent: true
	});
	if(image_id) shelljs.exec("docker rmi "+image_id, {
	  silent: true
	});
      });
    });
  });
}


var stat = {
  addContainer: (socket_id, container_id) => {
    activeContainers[socket_id] = container_id;
    activeSockets[container_id] = socket_id;
  },
  rmContainer: (socket_id) => {
    delete activeSockets[activeContainers[socket_id]];
    delete activeContainers[socket_id];
  },
  getContainerId: (socket_id) => {
    return activeContainers[socket_id];
  },
  getSocketId: (container_id) => {
    return activeSockets[container_id];
  },
  makeActive: (container_id) => {
    clearTimeout(idleContainers[container_id]);
  },
  makeIdle: (container_id) => {
    idleContainers[container_id] = setTimeout(() => {
      closeContainer(container_id);
      delete idleContainers[container_id];
    }, 600000);
  },
  get: () => {
    return {
      activeContainers: Object.keys(activeContainers).length,
      idleContainers: Object.keys(idleContainers).length
    }
  }
}

module.exports = stat;
