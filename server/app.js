var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var redis = require('redis'),
    db = redis.createClient();

var async = require('async');
var _ = require('underscore');
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
//  SOCKET & REDIS
//

db.on("error", function (err) {
    console.log("Error " + err);
});


app.post('/api/city', function (req, res) {

    var payload = req.body;

    db.get('tubes:city:id', function (err, id) {
        if (err) throw err;

        db.hmset('tubes:city:' + id, {
            id: id,
            name: payload.name,
            population: payload.population.toString(),
            map: JSON.stringify(payload.map)
        });

        res.json({
            id: id
        });

        db.sadd('tubes:city', id);

        db.incr('tubes:city:id');
    });



});

app.get('/api/city', function (req, res) {

    db.smembers('tubes:city', function (err, data) {
        if (err) throw err;
        async.map(data, function (id, callback) {
            db.hgetall('tubes:city:' + id, function (err, data) {
                callback(err, {
                    name: data.name,
                    population: parseInt(data.population, 10),
                    id: parseInt(id, 10),
                    map: JSON.parse(data.map)
                });
            });
        }, function(err, results){
            if (err) throw err;
            res.json(results);
        });
    });

});


app.get('/api/city/:id', function (req, res) {

    var id = req.params.id;

    db.hgetall('tubes:city:' + id, function (err, data) {
        if (err) throw err;
        if (data) {
            res.json({
                name: data.name,
                population: parseInt(data.population, 10),
                id: parseInt(id, 10),
                map: JSON.parse(data.map)
            });
        } else {
            res.send(404, 'Sorry, we cannot find that!');
        }
    });

});



app.delete('/api/city/:id', function (req, res) {

    var id = req.params.id;

    db.del('tubes:city:' + id);
    db.srem('tubes:city', id);

});

// io.sockets.on('connection', function (socket) {
    


// });