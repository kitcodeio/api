var activeContainers = {};
var activeSockets = {};
var idleContainers = {};

module.exports = {
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
    console.log(idleContainers);
  },
  makeIdle: (container_id) => {
    idleContainers[container_id] = setTimeout(() => {
      console.log(container_id);
      delete idleContainers[container_id];
    }, 5000);
  },
  total: () => {
    return Object.keys(activeContainers).length;
  }
}
