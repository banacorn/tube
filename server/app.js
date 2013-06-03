var path = require('path');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

// express
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Store = require('./store');
var momoryStore = require('./memory');

// redis
var redis = require('redis');
var db = redis.createClient();

// some shit
var async = require('async');
var _ = require('underscore');

// var city = require('./routes/city');

var tower = new EventEmitter;

//
//  EXPRESS
//

var staticAssets = [
    'images',
    'scripts',
    'stylesheets',
    'templates',
    'fonts',
    'api'
]

app.use(express.bodyParser());
app.use(function (req, res, next) {

    // is not static asset request
    var notStatic = staticAssets.indexOf(req.url.split(path.sep)[1]) == -1;
    if (notStatic)
        req.url = '/';

    next();
});
app.use(express.static(__dirname + './../client'));
server.listen(3000);


//
//
//



// io.sockets.on('connection', function () {

// });

//
//  SOCKET & REDIS
//

db.on("error", function (err) {
    console.log("Error " + err);
});

tower.on('init', function (id) {
    console.log('[App -> Tower -> Core] init', id);
    db.publish('tube', 'init:' + id);
});

// db.on("", function (channel, message) {
// });


var createPort = function (app, db, urlPreifx, keyPrefix) {

    var url = function () {
        return ['', urlPreifx].concat(Array.apply(null, arguments)).join('/');
    };
    
    var key = function () {
        return [keyPrefix].concat(Array.apply(null, arguments)).join(':');
    };

    var parseHash = function (hash) {
        for (k in hash) {
            hash[k] = JSON.parse(hash[k]);
        }
        return hash;
    };

    var stringifyHash = function (hash) {
        for (k in hash) {
            hash[k] = JSON.stringify(hash[k]);
        }
        return hash;
    };

    return function port (model) {

        // init
        db.setnx(key(model, 'id'), 0, function (err, reply) {
            if (err) throw err;
            if (reply === 1) {
                console.log('model', model, 'initialized');
                tower.emit('initialize');
            }
            
            // POST
            app.post(url(model), function (req, res) {
                var data = req.body;

                db.get(key(model, 'id'), function (err, id) {
                    if (err) throw err;
                    tower.emit('init', id);
                    db.hmset(key(model, id), stringifyHash(_.extend(data, {
                        id: id
                    })));
                    db.sadd(key(model), id);
                    db.incr(key(model, 'id'));
                    res.json({
                        id: id
                    });
                });
            });

            // GET ALL
            app.get(url(model), function (req, res) {
                db.smembers(key(model), function (err, ids) {
                    if (err) throw err;
                    async.map(ids, function (id, callback) {
                        db.hgetall(key(model, id), callback);
                    }, function(err, results) {
                        if (err) throw err;
                        res.json(results.map(parseHash));
                    });
                });
            });

            // GET 
            app.get(url(model, ':id'), function (req, res) {
                var id = req.params.id;
                db.hgetall(key(model, id), function (err, data) {
                    if (err) throw err;
                    if (data) {
                        res.json(parseHash(data));
                    } else {
                        res.send(404, 'Sorry, we cannot find that!');
                    }
                });
            });

            // PUT
            app.put(url(model, ':id'), function (req, res) {
                var id = req.params.id;
                var data = req.body;
                db.sadd(key(model), id);
                db.incr(key(model, 'id'));
                db.hmset(key(model, id), stringifyHash(data));
                res.send(200);
            });

            // DELETE
            app.delete(url(model, ':id'), function (req, res) {
                var id = req.params.id;
                db.del(key(model, id));
                db.srem(key(model), id);
                res.send(200);
            });
        })

    };
};

var port = createPort(app, db, 'api', 'tube');
port('simulation');

