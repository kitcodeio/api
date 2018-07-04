const shelljs = require('shelljs');

module.exports = {
  createVirtualHost: (ip, user)=>{
    shelljs.exec("sudo bash virtualhost.sh "+subdomain+" "+ip);
  }
};
