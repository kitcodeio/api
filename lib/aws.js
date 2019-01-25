const AWS = require('aws-sdk');
const fs = require('fs');

const crypto = require('../utils/crypto');

module.exports = config => {

  AWS.config.update({
    accessKeyId: config.auth.aws.id,
    secretAccessKey: config.auth.aws.key
  });

  const route53 = new AWS.Route53();
  const s3 = new AWS.S3({
    params: {
      Bucket: 'cdn.kitcode.io'
    }
  });

  return {
    createSubdomain() {
      let salt = crypto.generateSalt(20);
      let params = {
        ChangeBatch: {
          Changes: [{
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: salt + '-kide.kitcode.io',
              Type: 'A',
              TTL: 600,
              ResourceRecords: [{
                Value: '35.154.8.42'
              }]
            }
          }, {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: salt + '-app.kitcode.io',
              Type: 'A',
              TTL: 600,
              ResourceRecords: [{
                Value: '35.154.8.42'
              }]
            }
          }],
          Comment: 'OSE'
        },
        HostedZoneId: 'Z10WMTEOMM57IS'
      };
      return new Promise((resolve, reject) => {
        route53.changeResourceRecordSets(params, function(err, data) {
          if (err) return reject(err);
          return resolve(salt);
        });
      });
    },
    s3(path, file) {
      return new Promise((resolve, reject) => {
        s3.createBucket(() => {
          s3.upload({
            Key: path,
            Body: file
          }, (err, res) => {
            if (err) return reject(err);
	    return resolve(`https://cdn.kitcode.io/${path}`);
          });
        });
      });
    },
  };

};
