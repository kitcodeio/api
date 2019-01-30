'use strict';

const Docker = require('./Docker');

var Stats = (function() {

  const activeContainers = {};
  const activeSockets = {};
  const idleContainers = {};
  const activeClients = {};
  const clientSocket = {};

  let docker;

  function Stats(config) {
    docker = new Docker(config);
  }

  Stats.prototype.addContainer = function(socket_id, container_id) {
    activeContainers[socket_id] = container_id;
    activeSockets[container_id] = socket_id;
  };

  Stats.prototype.rmContainer = function(socket_id) {
    delete activeSockets[activeContainers[socket_id]];
    delete activeContainers[socket_id];
  };

  Stats.prototype.getContainerId = function(socket_id) {
    return activeContainers[socket_id];
  };

  Stats.prototype.getSocketId = function(container_id) {
    return activeSockets[container_id];
  };

  Stats.prototype.makeActive = function(container_id) {
    clearTimeout(idleContainers[container_id]);
  };

  Stats.prototype.makeIdle = function(container_id) {
    idleContainers[container_id] = setTimeout(() => {
      docker.stopContainer(container_id);
      delete idleContainers[container_id];
    }, 600000);
  };

  Stats.prototype.addClient = function(id, socket_id) {
    if (activeClients[id] == undefined) activeClients[id] = [];
    activeClients[id].push(socket_id);
    clientSocket[socket_id] = id;
  };

  Stats.prototype.removeClient = function(id, socket_id) {
    if (activeClients[id] !== undefined)
      activeClients[id] = activeClients[id].filter(id => id != socket_id);
    delete clientSocket[socket_id];
  };

  Stats.prototype.getClientSockets = function(id) {
    return activeClients[id] || [];
  };

  Stats.prototype.getSocketClients = function(id) {
    return clientSocket[id];
  };

  return Stats;

}());

module.exports = Stats;
