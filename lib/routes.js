const express = require('express');
const api = require('./api.js');
const router = express.Router();

router.post('/login', api.login);

router.post('/create/:model', api.create);
router.put('/update/:model', api.update);
router.get('/read/:model', api.read);
router.delete('/delete/:model/:id', api.delete);

module.exports = router;
