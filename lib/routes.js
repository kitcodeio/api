'use strict';

module.exports = function(config, io) {
  const course = require('./course-api.js')(config);
  const tutorial = require('./tutorial-api.js')(config);
  const api = require('./api')(config, io);
  return [{
    method: 'GET',
    path: '/{path*}',
    config: {
      handler: {
        directory: {
          path: __dirname + '/../public',
        },
      },
    },
  }, {
    method: 'POST',
    path: '/upload',
    config: {
      auth: 'jwt',
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
      },
    },
    handler: api.upload,
  }, {
    method: 'POST',
    path: '/login/social',
    handler: api.login.social,
  }, {
    method: 'POST',
    path: '/login',
    handler: api.login.simple,
  }, {
    method: 'POST',
    path: '/register',
    handler: api.create.client,
  }, {
    method: 'POST',
    path: '/create/api/Image',
    config: {
      auth: 'jwt',
    },
    handler: api.create.image,
  }, {
    method: 'POST',
    path: '/create/api/Container',
    config: {
      auth: 'jwt',
    },
    handler: api.create.container,
  }, {
    method: 'POST',
    path: '/create/api/Subdomain',
    config: {
      auth: 'jwt',
    },
    handler: api.create.subdomain,
  }, {
    method: 'POST',
    path: '/create/course/CategoryVersion',
    config: {
      auth: 'jwt',
    },
    handler: course.make.versions,
  }, {
    method: 'POST',
    path: '/create/course/{model}',
    config: {
      auth: 'jwt',
    },
    handler: course.make.all,
  }, {
    method: 'POST',
    path: '/tutorial',
    config: {
      auth: 'jwt',
    },
    handler: tutorial.create,
  }, {
    method: 'PUT',
    path: '/update/{model}',
    config: {
      auth: 'jwt',
    },
    handler: api.update,
  }, {
    method: 'PUT',
    path: '/approve/tutorial',
    config: {
      auth: 'jwt',
    },
    handler: tutorial.approve,
  }, {
    method: 'GET',
    path: '/read/api/Image',
    config: {
      auth: 'jwt',
    },
    handler: api.read.image,
  }, {
    method: 'GET',
    path: '/read/api/Subdomain',
    config: {
      auth: 'jwt',
    },
    handler: api.read.subdomain,
  }, {
    method: 'GET',
    path: '/read/api/Container',
    config: {
      auth: 'jwt',
    },
    handler: api.read.container,
  }, {
    method: 'GET',
    path: '/read/course/CourseCategory',
    handler: course.study.all,
  }, {
    method: 'GET',
    path: '/read/course/Course/{id}',
    handler: course.study.one.course,
  }, {
    method: 'GET',
    path: '/read/course/CourseSection/{id}',
    handler: course.study.one.section,
  }, {
    method: 'GET',
    path: '/read/course/CourseChapter/{id}',
    handler: course.study.one.chapter,
  }, {
    method: 'GET',
    path: '/read/course/one/Course/{id}',
    handler: course.study.one.usercourse,
  }, {
    method: 'GET',
    path: '/search/course/{model}',
    handler: course.search,
  }, {
    method: 'GET',
    path: '/search/api/{model}',
    config: {
      auth: 'jwt',
    },
    handler: api.search,
  }, {
    method: 'GET',
    path: '/course/signup/{id}',
    config: {
      auth: 'jwt',
    },
    handler: course.signup,
  }, {
    method: 'GET',
    path: '/tutorial',
    config: {
      auth: 'jwt',
    },
    handler: tutorial.read,
  }, {
    method: 'GET',
    path: '/verify',
    handler: api.verify,
  }, {
    method: 'GET',
    path: '/ping',
    handler: api.ping,
  }, {
    method: 'GET',
    path: '/run/{id}',
    config: {
      auth: 'jwt',
    },
    handler: api.run,
  }, {
    method: 'DELETE',
    path: '/delete/api/Image/{id}',
    config: {
      auth: 'jwt',
    },
    handler: api.delete.image,
  }, {
    method: 'DELETE',
    path: '/delete/course/{model}/{id}',
    handler: course.remove,
  },
  ];
};
