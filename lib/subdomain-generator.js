const AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.update({
    accessKeyId: 'AKIAJDAKEAAE2E3FOSDA',
    secretAccessKey: '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'
});

const route53 = new AWS.Route53();

function generateSalt() {
  return crypto.randomBytes(20).toString('hex');
}

function createSubdomain(salt){
    var params = {
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
            }, {
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: salt + '-terminal.kitcode.io',
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

    route53.changeResourceRecordSets(params, function(err, data) {
      if (err) console.log(err);
    });
}

module.exports = () => {
  let salt = generateSalt();
  createSubdomain(salt);
  return salt;
}
