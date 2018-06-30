const docker = require('./docker');
const aws = require('./aws');

const regexp = new RegExp('(.*)@');

module.exports = {
  create: (email) => {
    let user = regexp.exec(email)[1];
    aws.createSubdomain(user);
    docker.createContainer(user);
  }
};
