const docker = require('./docker');
const aws = require('./aws');

module.exports = {
  create: (subdomain) => {
    //aws.createSubdomain(user);
    docker.createContainer(subdomain);
  }
};
