'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('CourseCategories', [{
      index: null,
      label: 'Node.js',
      logo: '/assets/category/nodejs.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'PyTorch',
      logo: '/assets/category/pytorch.png',
      visibility: true,
      parent_id: 7,
    }, {
      index: null,
      label: 'MongoDB',
      logo: '/assets/category/mongo.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'ionic',
      logo: '/assets/category/ionic.png',
      visibility: true,
      parent_id: 1,
    }, {
      index: null,
      label: 'web pack',
      logo: '/assets/category/webpack.png',
      visibility: true,
      parent_id: 1,
    }, {
      index: null,
      label: 'php',
      logo: '/assets/category/php.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'git',
      logo: '/assets/category/git.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'jupyter notebook',
      logo: '/assets/category/jupyter.png',
      visibility: true,
      parent_id: 7,
    }, {
      index: null,
      label: 'TensorFlow',
      logo: '/assets/category/tensorflow.jpg',
      visibility: true,
      parent_id: 7,
    }, {
      index: null,
      label: 'React',
      logo: '/assets/category/react.png',
      visibility: true,
      parent_id: 1,
    }, {
      index: null,
      label: 'Angular.js',
      logo: '/assets/category/angular.png',
      visibility: true,
      parent_id: 1,
    }, {
      index: null,
      label: 'C',
      logo: '/assets/category/c.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'Java',
      logo: '/assets/category/java.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'C#',
      logo: '/assets/category/chsharp.jpg',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'Python2.7',
      logo: '/assets/category/python.png',
      visibility: true,
      parent_id: null,
    }, {
      index: null,
      label: 'Flask',
      logo: '/assets/category/flask.jpg',
      visibility: true,
      parent_id: 7,
    },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Courses', [{}, ]);
  },
};
