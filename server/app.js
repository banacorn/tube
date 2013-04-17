var path = require('path');

// express
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// redis
var redis = require('redis');
var db = redis.createClient();

// some shit
var async = require('async');
var _ = require('underscore');

// var city = require('./routes/city');

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

    // setTimeout(function () {
        next();
    // }, 3000);
});

app.use(express.static(__dirname + './../client'));


server.listen(3000);

//
//  SOCKET & REDIS
//

db.on("error", function (err) {
    console.log("Error " + err);
});


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
            }
            
            // POST
            app.post(url(model), function (req, res) {
                var data = req.body;
                db.get(key(model, 'id'), function (err, id) {
                    if (err) throw err;
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

var port = createPort(app, db, 'api', 'tubes');

port('city');
port('terrain');



// CITY

// app.post('/api/city', function (req, res) {

//     var payload = req.body;
//     db.get('tubes:city:id', function (err, id) {
//         if (err) throw err;

//         db.hmset('tubes:city:' + id, {
//             id: id,
//             name: payload.name,
//             population: payload.population.toString()
//         });

//         res.json({
//             id: id
//         });

//         db.sadd('tubes:city', id);

//         db.incr('tubes:city:id');
//     });



// });

// app.get('/api/city', function (req, res) {

//     db.smembers('tubes:city', function (err, data) {
//         if (err) throw err;
//         async.map(data, function (id, callback) {
//             db.hgetall('tubes:city:' + id, function (err, data) {
//                 callback(err, {
//                     name: data.name,
//                     population: parseInt(data.population, 10),
//                     id: parseInt(id, 10)
//                 });
//             });
//         }, function(err, results){
//             if (err) throw err;
//             res.json(results);
//         });
//     });

// });


// app.get('/api/city/:id', function (req, res) {

//     var id = req.params.id;

//     db.hgetall('tubes:city:' + id, function (err, data) {
//         if (err) throw err;
//         if (data) {
//             res.json({
//                 name: data.name,
//                 population: parseInt(data.population, 10),
//                 id: parseInt(id, 10)
//             });
//         } else {
//             res.send(404, 'Sorry, we cannot find that!');
//         }
//     });
// });



// app.delete('/api/city/:id', function (req, res) {

//     var id = req.params.id;

//     db.del('tubes:city:' + id);
//     db.srem('tubes:city', id);

// });

// // TERRAIN



// app.get('/api/terrain/:id', function (req, res) {
//     var id = req.params.id;
//     db.hgetall('tubes:terrain:' + id, function (err, data) {
//         if (err) throw err;
//         if (data) {
//             res.json(parseHash(data));
//         } else {
//             res.send(404, 'Sorry, we cannot find that!');
//         }
//     });
// });

// app.get('/api/terrain', function (req, res) {
//     db.smembers('tubes:terrain', function (err, data) {
//         if (err) throw err;
//         async.map(data, function (id, callback) {
//             db.hgetall('tubes:terrain:' + id, callback);
//         }, function(err, results){
//             if (err) throw err;
//             res.json(results.map(parseHash));
//         });
//     });
// });

// app.post('/api/terrain', function (req, res) {

//     var payload = req.body;

//     db.hmset('tubes:terrain:' + payload.id, stringifyHash(payload));
//     res.json({
//         id: payload.id
//     });
//     db.sadd('tubes:terrain', payload.id);
// });


// app.put('/api/terrain/:id', function (req, res) {

//     var payload = req.body;
//     var id = req.params.id;

//     db.hmset('tubes:terrain:' + id, stringifyHash(payload));
//     res.json({
//         id: id
//     });
//     db.sadd('tubes:terrain', id);
// });


// app.delete('/api/terrain/:id', function (req, res) {

//     var id = req.params.id;

//     db.del('tubes:terrain:' + id);
//     db.srem('tubes:terrain', id);

// });