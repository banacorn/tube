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


var parseHash = function (hash) {
    for (key in hash) {
        hash[key] = JSON.parse(hash[key]);
    }
    return hash;
};

var stringifyHash = function (hash) {
    for (key in hash) {
        hash[key] = JSON.stringify(hash[key]);
    }
    return hash;
};


// CITY

app.post('/api/city', function (req, res) {

    var payload = req.body;
    db.get('tubes:city:id', function (err, id) {
        if (err) throw err;

        db.hmset('tubes:city:' + id, {
            id: id,
            name: payload.name,
            population: payload.population.toString()
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
                    id: parseInt(id, 10)
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
                id: parseInt(id, 10)
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

// TERRAIN



app.get('/api/terrain/:id', function (req, res) {
    var id = req.params.id;
    db.get('tubes:terrain:' + id, function (err, data) {
        if (err) throw err;
        if (data) {
            res.json(JSON.parse(data));
        } else {
            res.send(404, 'Sorry, we cannot find that!');
        }
    });
});

app.get('/api/terrain', function (req, res) {
    db.smembers('tubes:terrain', function (err, data) {
        if (err) throw err;
        async.map(data, function (id, callback) {
            db.get('tubes:terrain:' + id, callback);
        }, function(err, results){
            if (err) throw err;
            res.json(results.map(JSON.parse));
        });
    });
});

app.post('/api/terrain', function (req, res) {

    var payload = req.body;

    db.set('tubes:terrain:' + payload.id, JSON.stringify(payload.map));
    res.json({
        id: payload.id
    });
    db.sadd('tubes:terrain', payload.id);
});


app.put('/api/terrain/:id', function (req, res) {

    var payload = req.body;
    var id = req.params.id;

    db.set('tubes:terrain:' + id, JSON.stringify(payload.map));
    res.json({
        id: id
    });
    db.sadd('tubes:terrain', id);
});
