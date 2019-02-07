const nodemailer = require('nodemailer');
const templates = require('../config/email-templates.json');


module.exports = config => {
  const from =  config.mail.user;
  const transporter = nodemailer.createTransport({
    host: config.mail.server.host,
    secure: true,
    auth: {
      user: config.mail.user,
      pass: config.mail.password
    }
  });
  return {
    send({email, type, options}) {
      let html, subject, to = email.join(',');
      switch(type){
      case 'verification':
        let token = options.token || '';
        html =  templates[type].replace(/{{token}}/g, token);
        subject = 'Verify your email';
        break;
      }
      transporter.sendMail({from, to, subject, html}, function(err) {
        if (err) console.error(err);
      });

    }
  };
};
