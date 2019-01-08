'use strict';

const activeContainers = {};
const activeSockets = {};
const idleContainers = {};
const activeClients = {};
const clientSocket = {};

module.exports = config => {
  const docker = require('./docker')(config);
  return {
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
        docker.stopContainer(container_id);
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
    },
  };
};
