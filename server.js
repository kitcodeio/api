const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./config.json');
const routes = require('./lib/routes');

const app = express();
const env = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

async function start() {
  try {
    await app.listen(config[env].port, () => {
      console.log("Server is online at port:" + config[env].port);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
