#!/usr/bin/env node
var program = require('commander');
var request = require('request');

var mongodbHelper = require('./helpers/mongodbHelper').initMongoDbConnection();
var config = require('./config');

program
    .option('-a, --apikey <api-key>', 'Mailgun\'s api-key')
    .option('-d, --domainname <domain-name>', 'Domain name to retrieve event log')
    .parse(process.argv)
;


var initialUrl = 'https://api.mailgun.net/v3/' + program.domainname + '/events';

doRequest(initialUrl);

function doRequest(url) {
    request
        .get(
            {
                url: url,
                qs: {
                    "limit": 300
                }
            }, function (error, response, body) {
                jsonObj = JSON.parse(body);

                mongodbHelper.db.collection(config.mongodb.collection).insertMany(jsonObj.items);
                console.log('inserted %d', jsonObj.items.length);
                if (url !== jsonObj.paging.next) {
                    doRequest(jsonObj.paging.next);
                }
                return 0;
            }
        )
        .auth('api', program.apikey, true)
    ;
}

