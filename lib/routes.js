const express = require('express');
const api = require('./api.js');
const router = express.Router();

router.post('/login', api.login);
router.post('/register', api.create.client);

router.post('/create/Image', api.create.image);
router.post('/create/Container', api.create.container);

router.put('/update/user', api.update);

router.get('/read/:model', api.read);

router.delete('/delete/Image/:id', api.delete.image);
router.delete('/delete/Container/:id', api.delete.container);

router.post('/submit', api.submit);

module.exports = router;
