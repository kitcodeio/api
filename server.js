const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

async function start() {
  try{
    await app.listen(PORT, ()=>{
      console.log("Server is online at port:"+PORT);
    });
  } catch(err) {
    console.log(err);
  }
}

start();
