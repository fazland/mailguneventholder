var config = require('./../config');
var MongoClient = require('mongodb').MongoClient;


module.exports = {
    db: 'undefined',

    initMongoDbConnection: function() {
        var url = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;
        var that = this;

        MongoClient.connect(url, function(err, database) {
            console.log("Connected correctly to server");

            that.db = database;
        });

        return this;
    }
};
