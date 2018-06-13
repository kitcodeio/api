const express = require('express');
const api = require('./api.js');
const router = express.Router();

router.post('/login', api.login);

modules.exports = router;
