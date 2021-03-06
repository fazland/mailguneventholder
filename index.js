#!/usr/bin/env node
var program = require('commander');
var request = require('request');

var mongodbHelper = require('./helpers/mongodbHelper').initMongoDbConnection();
var config = require('./config');

program
    .option('-a, --apikey <api-key>', 'Mailgun\'s api-key')
    .option('-d, --domainname <domain-name>', 'Domain name to retrieve event log')
    .option('-i, --messageId <message-id>', 'Start message id, from this id start to retrieve events')
    .option('-u, --starturl <start-url>', 'Start url, from this url start to retrieve events')
    .parse(process.argv)
;

var initialUrl = '';

if (program.starturl != null) {
    initialUrl = program.starturl;
} else {
    initialUrl = 'https://api.mailgun.net/v3/' + program.domainname + '/events';
}

doRequest(initialUrl);

function doRequest(url) {
    console.log(url);
    request
        .get(
            {
                url: url,
                qs: {
                    "limit": 300,
                    "message-id": program.messageId
                }
            }, function (error, response, body) {
                jsonObj = JSON.parse(body);

                mongodbHelper.db.collection(config.mongodb.collection).insertMany(jsonObj.items);

                console.log('inserted %d', jsonObj.items.length);
                console.log('Next link %s', jsonObj.paging.next);

                if (url !== jsonObj.paging.next) {
                    doRequest(jsonObj.paging.next);
                }
                return 0;
            }
        )
        .auth('api', program.apikey, true)
    ;
}

