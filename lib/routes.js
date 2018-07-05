const express = require('express');

const api = require('./api.js');
const course = require('./course-api.js');

const router = express.Router();

router.post('/login', api.login);
router.post('/register', api.create.client);

router.post('/create/Image', api.create.image);
router.post('/create/Container', api.create.container);

router.post('/make/:model', api.make);

router.put('/update/user', api.update);

router.get('/read/Image', api.read.image);
router.get('/read/Course', api.read.course.all);
router.get('/read/Course/:id', api.read.course.one)

router.delete('/delete/Image/:id', api.delete.image);
router.delete('/delete/Container/:id', api.delete.container);

router.post('/submit', api.submit);

module.exports = router;
