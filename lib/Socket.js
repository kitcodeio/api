'use strict';

const io = require('socket.io');
const Db = require('./db');
const Stats = require('./Stats');

var Socket = (function() {

  var db, stat, socket;

  function Socket(config, listener) {
    if (listener) this.io = io(listener).on('connection', this.init.bind(this));

    db = Db(config);
    stat = new Stats(config);
  }

  Socket.prototype.init = function(_socket) {
    socket = _socket;
    socket.emit('ping', 'reality is an illusion');
    socket.on('kitcode', this.addUser.bind(this));
    socket.on('info', this.makeActive.bind(this));
    socket.on('kide:closed', this.makeIdle.bind(this));
    socket.on('disconnect', this.disconnect.bind(this));
  };

  Socket.prototype.addUser = async function(id) {
    stat.addClient(id, socket.id);
  };

  Socket.prototype.makeActive = async function(data) {
    let container_id = data.id.replace('\n', '');
    db.updateEntry('Container', {
      where: {
        id: container_id
      }
    }, {
      state: 'active'
    });
    stat.addContainer(socket.id, container_id);
    stat.makeActive(container_id);
  };

  Socket.prototype.makeIdle = async function() {
    let entry_id = stat.getContainerId(socket.id);
    if (entry_id) {
      stat.rmContainer(socket.id);
      stat.makeIdle(entry_id);
      db.updateEntry('Container', {
        where: {
          id: entry_id
        }
      }, {
        state: 'idle'
      });
    }
  };

  Socket.prototype.disconnect = async function() {
    let entry_id = stat.getContainerId(socket.id);
    let id = stat.getSocketClients(socket.id);
    if (id) stat.removeClient(id, socket.id);
    if (entry_id) {
      stat.rmContainer(socket.id);
      stat.makeIdle(entry_id);
      db.updateEntry('Container', {
        where: {
          id: entry_id
        }
      }, {
        state: 'idle'
      });
    }
  };

  return Socket;

}());

module.exports = Socket;
