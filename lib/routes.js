'use strict';

const Api = require('./Api');

module.exports = function(config, io) {
  const course = require('./course-api.js')(config);

  return [{
    method: 'GET',
    path: '/{path*}',
    config: {
      handler: {
        directory: {
          path: __dirname + '/../public'
        }
      }
    }
  }, {
    method: 'POST',
    path: '/upload',
    config: {
      auth: 'jwt',
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      }
    },
    handler: new api(config).upload
  }, {
    method: 'POST',
    path: '/login/social',
    handler: api.auth.social
  }, {
    method: 'POST',
    path: '/login',
    handler: api.auth.simple
  }, {
    method: 'POST',
    path: '/register',
    handler: api.user.create
  }, {
    method: 'POST',
    path: '/create/api/Image',
    config: {
      auth: 'jwt'
    },
    handler: api.image.create
  }, {
    method: 'POST',
    path: '/create/api/Container',
    config: {
      auth: 'jwt'
    },
    handler: api.container.create
  }, {
    method: 'POST',
    path: '/create/api/Subdomain',
    config: {
      auth: 'jwt'
    },
    handler: api.subdomain.create
  }, {
    method: 'POST',
    path: '/create/course/CategoryVersion',
    config: {
      auth: 'jwt'
    },
    handler: course.make.versions
  }, {
    method: 'POST',
    path: '/create/course/{model}',
    config: {
      auth: 'jwt'
    },
    handler: course.make.all
  }, {
    method: 'POST',
    path: '/tutorial',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.create
  }, {
    method: 'PUT',
    path: '/update/Tutorial',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.update
  }, {
    method: 'PUT',
    path: '/update/{model}',
    config: {
      auth: 'jwt'
    },
    handler: api.update
  }, {
    method: 'PUT',
    path: '/approve/tutorial',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.approve
  }, {
    method: 'GET',
    path: '/read/api/Image',
    config: {
      auth: 'jwt'
    },
    handler: api.image.read
  }, {
    method: 'GET',
    path: '/read/api/Subdomain',
    config: {
      auth: 'jwt'
    },
    handler: api.subdomain.read
  }, {
    method: 'GET',
    path: '/read/api/Container',
    config: {
      auth: 'jwt'
    },
    handler: api.container.read
  }, {
    method: 'GET',
    path: '/read/course/CourseCategory',
    handler: course.study.all
  }, {
    method: 'GET',
    path: '/read/course/Course/{id}',
    handler: api.tutorial.read
  }, {
    method: 'GET',
    path: '/read/course/CourseChapter/{id}',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.detail
  }, {
    method: 'GET',
    path: '/search/course/{model}',
    handler: course.search
  }, {
    method: 'GET',
    path: '/search/api/{model}',
    handler: api.search
  }, {
    method: 'GET',
    path: '/tutorial',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.read
  }, {
    method: 'GET',
    path: '/verify',
    handler: api.auth.verify
  }, /*{
    method: 'GET',
    path: '/run/{id}',
    config: {
      auth: 'jwt',
    },
    handler: api.container.run,
  },*/ {
    method: 'DELETE',
    path: '/delete/course/{model}/{id}',
    config: {
      auth: 'jwt'
    },
    handler: course.remove
  }, {
    method: 'DELETE',
    path: '/delete/tutorial/{id}',
    config: {
      auth: 'jwt'
    },
    handler: api.tutorial.delete
  }];
};
