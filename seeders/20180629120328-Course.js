'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('CourseCategories', [{
        index: null,
        label: 'Node.js',
        logo: 'https://cdn.kitcode.io/CourseCategory/0319582e052cb942ddf28dc6de3d8f9a.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'PyTorch',
        logo: 'https://cdn.kitcode.io/CourseCategory/266f9aee527da1de8806d4173fc1f83c.png',
        visibility: true,
        parent_id: 7
      }, {
        index: null,
        label: 'MongoDB',
        logo: 'https://cdn.kitcode.io/CourseCategory/eb9ae0242571a02b513aa5ee8e915230.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'ionic',
        logo: 'https://cdn.kitcode.io/CourseCategory/cf76fbaff55b467355c637a61afdaece.png',
        visibility: true,
        parent_id: 1
      }, {
        index: null,
        label: 'web pack',
        logo: 'https://cdn.kitcode.io/CourseCategory/d1745376198dbe9b84b15d2aaa865180.png',
        visibility: true,
        parent_id: 1
      }, {
        index: null,
        label: 'php',
        logo: 'https://cdn.kitcode.io/CourseCategory/e8874bf7a06399ce4645e29fad8db37d.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'git',
        logo: 'https://cdn.kitcode.io/CourseCategory/e47deb3d8f1e1984f55c3e57cd64294b.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'jupyter notebook',
        logo: 'https://cdn.kitcode.io/CourseCategory/853416c957027fd840fe4f77e82674cf.png',
        visibility: true,
        parent_id: 7
      }, {
        index: null,
        label: 'TensorFlow',
        logo: 'https://cdn.kitcode.io/CourseCategory/5cb885417960ab6acbb0ba762bc0f7cf.jpg',
        visibility: true,
        parent_id: 7
      }, {
        index: null,
        label: 'React',
        logo: 'https://cdn.kitcode.io/CourseCategory/9e74c7d424967dcab491bbe0a8c74c45.png',
        visibility: true,
        parent_id: 1
      }, {
        index: null,
        label: 'Angular.js',
        logo: 'https://cdn.kitcode.io/CourseCategory/b92b3015732ef5706c9807b61f814487.png',
        visibility: true,
        parent_id: 1
      }, {
        index: null,
        label: 'C',
        logo: 'https://cdn.kitcode.io/CourseCategory/788e703fd10c1832ea7103f7d50b5859.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'Java',
        logo: 'https://cdn.kitcode.io/CourseCategory/ee9d21839e1d117af3b3a7d4c98c458e.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'C#',
        logo: 'https://cdn.kitcode.io/CourseCategory/46726f8dbf72457bc136f2ec7b825ac6.jpg',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'Python2.7',
        logo: 'https://cdn.kitcode.io/CourseCategory/321778b98a7c493970c817e67a69c086.png',
        visibility: true,
        parent_id: null
      }, {
        index: null,
        label: 'Flask',
        logo: 'https://cdn.kitcode.io/CourseCategory/ce30c5acd7db86fcd793857fa293e669.jpg',
        visibility: true,
        parent_id: 7
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Courses', [{}, ]);
  },
};
