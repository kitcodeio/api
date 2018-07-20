const express = require('express');

const api = require('./api.js');
const course = require('./course-api.js');

const router = express.Router();

router.post('/login', api.login);
router.post('/register', api.create.client);

router.post('/create/api/Image', api.create.image);
router.post('/create/api/Container', api.create.container);

router.post('/create/course/:model', course.make);

router.put('/update/:model', api.update);

router.get('/read/api/Image', api.read.image);

router.get('/read/course/CourseCategory', course.study.all);
router.get('/read/course/Course/:id', course.study.one.course);
router.get('/read/course/CourseSection/:id', course.study.one.section);
router.get('/read/course/CourseChapter/:id', course.study.one.chapter);

router.delete('/delete/api/Image/:id', api.delete.image);
router.delete('/delete/course/:model/:id', course.remove);

router.post('/upload', api.upload);

router.get('*', api.pnf);
router.post('*', api.pnf);
router.put('*', api.pnf);
router.delete('*', api.pnf);

module.exports = router;
