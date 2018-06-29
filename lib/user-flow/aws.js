const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIAJDAKEAAE2E3FOSDA',
  secretAccessKey: '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'
});

const route53 = new AWS.Route53();

module.exports = {
  createSubdomain: (user) => {
    var params = {
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: user + '-kide.kitcode.io',
            Type: 'A',
            TTL: 600,
            ResourceRecords: [{
              Value: '35.154.8.42'
            }]
          }
        }, {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: user + '-app.kitcode.io',
            Type: 'A',
            TTL: 600,
            ResourceRecords: [{
              Value: '35.154.8.42'
            }]
          }
        }, {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: user + '-terminal.kitcode.io',
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
      //let date = new Date();
      console.log(err, data);
      //if (err) {
      //  let string = date + ' ' + JSON.stringify(err) + '\n';
      //  fs.appendFile('../logs/route53-error.log', string, (error) => {
      //    if (error) throw error;
      //    else console.log('likh dis');
      //  });
      //} else {
      //  let string = date + ' ' + JSON.stringify(data) + '\n';
      //  fs.appendFile('../logs/route53-success.log', JSON.stringify(data), (error) => {
      //    if (error) throw error;
      //    else console.log('likh dis');
      //  });
      //}
    });
  }
};
