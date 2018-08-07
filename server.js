const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const socket = require('socket.io');

const config = require('./config/serverconfig.json');
const rbac = require('./lib/rbac');
const routes = require('./lib/routes');
const errorHandler = require('./lib/errorHandler');
const sockets = require('./lib/socket.js');

const app = express();
const env = process.env.NODE_ENV || 'staging';
const server = require('http').createServer(app);

const unless = [/\/read\/course\/.*/, '/login', '/register', /\/search\/Course.*/];

app.use(cors());
app.use(express.static('public'));
app.use(jwt({
  secret: config[env].jwtsecret
}).unless({
  path: unless
}));
app.use(rbac());
app.use(bodyParser.json());
app.use(routes);

app.use(errorHandler);


var io = require('socket.io')(server);
io.on('connection', sockets);

async function start() {
  try {
    await server.listen(config[env].port, () => {
      console.log(`Server is online at port:${config[env].port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
