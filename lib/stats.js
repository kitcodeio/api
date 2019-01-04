const Docker = require('dockerode');
const shelljs = require('shelljs');

const dbms = require('./db');
const dockerjs = require('./docker');

var db = {};

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

var activeContainers = {};
var activeSockets = {};
var idleContainers = {};

var activeClients = {};
var clientSocket = {};

async function closeContainer(entry_id) {
  let result = await db.readEntry('Container', 'findOne', {
    where: {
      id: entry_id
    }
  });
  let container_id = result.entity.toJSON().container_id;
  let image_id = result.entity.toJSON().image_id;
  let subdomain = result.entity.toJSON().subdomain;
  let data = await dockerjs.stopContainer(container_id, image_id);
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


var stat = {
  addContainer(socket_id, container_id) {
    activeContainers[socket_id] = container_id;
    activeSockets[container_id] = socket_id;
  },
  rmContainer(socket_id) {
    delete activeSockets[activeContainers[socket_id]];
    delete activeContainers[socket_id];
  },
  getContainerId(socket_id) {
    return activeContainers[socket_id];
  },
  getSocketId(container_id) {
    return activeSockets[container_id];
  },
  makeActive(container_id) {
    clearTimeout(idleContainers[container_id]);
  },
  makeIdle(container_id) {
    idleContainers[container_id] = setTimeout(() => {
      closeContainer(container_id);
      delete idleContainers[container_id];
    }, 600000);
  },
  addClient(id, socket_id) {
    if (activeClients[id] == undefined) activeClients[id] = [];
    activeClients[id].push(socket_id);
    clientSocket[socket_id] = id;
  },
  removeClient(id, socket_id) {
    if (activeClients[id] !== undefined)
      activeClients[id] = activeClients[id].filter(id => id != socket_id);
    delete clientSocket[socket_id];
  },
  getClientSockets(id) {
    return activeClients[id] || [];
  },
  getSocketClients(id) {
    return clientSocket[id];
  }
}

module.exports = function(config) {
  db = dbms(config);
  return stat
};
