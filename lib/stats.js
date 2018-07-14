var activeContainers = {};
var activeSockets = {};

module.exports = {
  addContainer: (socket_id, container_id) => {
    activeContainers[socket_id] = container_id;
    activeSockets[container_id] = socket_id;
    console.log(activeContainers);
  },
  rmContainer: (socket_id) => {
    delete activeContainers[socket_id];
  },
  getContainerId: (socket_id) => {
    return activeContainers[socket_id];
  },
  getSocketId: (container_id) => {
    return activeSockets[container_id];
  },
  total: () => {
    return Object.keys(activeContainers).length;
  }
}
